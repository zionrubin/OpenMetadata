/*
  * Licensed to the Apache Software Foundation (ASF) under one or more
  * contributor license agreements. See the NOTICE file distributed with
  * this work for additional information regarding copyright ownership.
  * The ASF licenses this file to You under the Apache License, Version 2.0
  * (the "License"); you may not use this file except in compliance with
  * the License. You may obtain a copy of the License at

  * http://www.apache.org/licenses/LICENSE-2.0

  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
*/

import { AxiosError, AxiosResponse } from 'axios';
import { Paging } from 'Models';
import React, { useEffect, useState } from 'react';
import {
  addIngestionWorkflow,
  deleteIngestionWorkflowsById,
  getIngestionWorkflows,
  triggerIngestionWorkflowsById,
  updateIngestionWorkflow,
} from '../../axiosAPIs/ingestionWorkflowAPI';
import { getServices } from '../../axiosAPIs/serviceAPI';
import Ingestion from '../../components/Ingestion/Ingestion.component';
import { IngestionData } from '../../components/Ingestion/ingestion.interface';
import Loader from '../../components/Loader/Loader';
import { DatabaseService } from '../../generated/entity/services/databaseService';
import { EntityReference } from '../../generated/type/entityReference';
import useToastContext from '../../hooks/useToastContext';
import { getCurrentUserId } from '../../utils/CommonUtils';
import { getOwnerFromId } from '../../utils/TableUtils';

const IngestionPage = () => {
  const showToast = useToastContext();
  const [isLoading, setIsLoading] = useState(true);
  const [ingestions, setIngestions] = useState([]);
  const [serviceList, setServiceList] = useState<Array<DatabaseService>>([]);
  const [paging, setPaging] = useState<Paging>({} as Paging);
  const getDatabaseServices = () => {
    getServices('databaseServices')
      .then((res: AxiosResponse) => {
        setServiceList(res.data.data);
      })
      .catch((err: AxiosError) => {
        // eslint-disable-next-line
        console.log(err);
      });
  };

  const getAllIngestionWorkflows = (paging?: string) => {
    getIngestionWorkflows(['owner, service, tags, status'], paging)
      .then((res) => {
        if (res.data.data) {
          setIngestions(res.data.data);
          setPaging(res.data.paging);
          setIsLoading(false);
        } else {
          setPaging({} as Paging);
        }
      })
      .catch((err: AxiosError) => {
        const msg = err.message;
        showToast({
          variant: 'error',
          body: msg ?? `Error while getting ingestion workflow`,
        });
      });
  };

  const triggerIngestionById = (
    id: string,
    displayName: string
  ): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      triggerIngestionWorkflowsById(id)
        .then((res) => {
          if (res.data) {
            resolve();
            getAllIngestionWorkflows();
          } else {
            reject();
          }
        })
        .catch((err: AxiosError) => {
          const msg = err.message;
          showToast({
            variant: 'error',
            body:
              msg ?? `Error while triggering ingestion workflow ${displayName}`,
          });
          reject();
        });
    });
  };

  const deleteIngestionById = (
    id: string,
    displayName: string
  ): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      deleteIngestionWorkflowsById(id)
        .then(() => {
          resolve();
          getAllIngestionWorkflows();
        })
        .catch((err: AxiosError) => {
          const msg = err.message;
          showToast({
            variant: 'error',
            body:
              msg ?? `Error while deleting ingestion workflow ${displayName}`,
          });
          reject();
        });
    });
  };

  const updateIngestion = (
    data: IngestionData,
    id: string,
    displayName: string,
    triggerIngestion?: boolean
  ): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      updateIngestionWorkflow(data)
        .then(() => {
          resolve();
          getAllIngestionWorkflows();
          if (triggerIngestion) {
            triggerIngestionById(id, displayName).then();
          }
        })
        .catch((err: AxiosError) => {
          const msg = err.message;
          showToast({
            variant: 'error',
            body:
              msg ?? `Error while updating ingestion workflow ${displayName}`,
          });
          reject();
        });
    });
  };

  const addIngestionWorkflowHandler = (
    data: IngestionData,
    triggerIngestion?: boolean
  ) => {
    setIsLoading(true);
    const service = serviceList.find((s) => s.name === data.service.name);
    const owner = getOwnerFromId(getCurrentUserId());
    const ingestionData = {
      ...data,
      service: {
        id: service?.id,
        type: 'databaseService',
        name: data.service.name,
      } as EntityReference,
      owner: {
        id: owner?.id as string,
        name: owner?.name,
        type: 'user',
      },
    };

    addIngestionWorkflow(ingestionData)
      .then((res: AxiosResponse) => {
        const { id, displayName } = res.data;
        setIsLoading(false);
        getAllIngestionWorkflows();
        if (triggerIngestion) {
          triggerIngestionById(id, displayName).then();
        }
      })
      .catch((err: AxiosError) => {
        const msg = err.message;
        showToast({
          variant: 'error',
          body: msg ?? `Something went wrong`,
        });
        setIsLoading(false);
      });
  };

  const pagingHandler = (cursorType: string) => {
    const pagingString = `&${cursorType}=${
      paging[cursorType as keyof typeof paging]
    }`;
    getAllIngestionWorkflows(pagingString);
  };

  useEffect(() => {
    getDatabaseServices();
    getAllIngestionWorkflows();
  }, []);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <Ingestion
          addIngestion={addIngestionWorkflowHandler}
          deleteIngestion={deleteIngestionById}
          ingestionList={ingestions}
          paging={paging}
          pagingHandler={pagingHandler}
          serviceList={serviceList}
          triggerIngestion={triggerIngestionById}
          updateIngestion={updateIngestion}
        />
      )}
    </>
  );
};

export default IngestionPage;
