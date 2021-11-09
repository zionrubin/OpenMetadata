package org.openmetadata.catalog.ingestion;

import org.openmetadata.catalog.api.operations.workflows.CreateIngestion;
import org.openmetadata.catalog.operations.workflows.Ingestion;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class AirflowUtils {

    public static OpenMetadataIngestionComponent makeDatasourceComponent(Ingestion ingestion) {
        Map<String, Object> dbConfig = new HashMap<>();
        dbConfig.put("host_port", ingestion.getConnectorConfig().getHost());
        dbConfig.put("username", ingestion.getConnectorConfig().getUsername());
        dbConfig.put("password", ingestion.getConnectorConfig().getPassword());
        dbConfig.put("database", ingestion.getConnectorConfig().getDatabase());
        dbConfig.put("service_name", ingestion.getService().getName());
        dbConfig.put("filter_pattern", ingestion.getConnectorConfig().getIncludeFilterPattern());
        return OpenMetadataIngestionComponent.builder()
                .type(ingestion.getService().getType())
                .config(dbConfig).build();
    }

    public static OpenMetadataIngestionComponent makeMetadataSourceComponent(Ingestion ingestion) {
        Map<String, Object> dbConfig = new HashMap<>();
        return OpenMetadataIngestionComponent.builder()
                .type("metadata")
                .config(dbConfig)
                .build();
    }

    public static OpenMetadataIngestionComponent makeElasticSearchSinkComponent(Ingestion ingestion) {
        Map<String, Object> sinkConfig = new HashMap<>();
        return OpenMetadataIngestionComponent.builder()
                .type("elasticsearch")
                .config(sinkConfig).build();
    }

    public static OpenMetadataIngestionComponent makeOpenMetadataSinkComponent(Ingestion ingestion) {
        Map<String, Object> sinkConfig = new HashMap<>();
        return OpenMetadataIngestionComponent.builder()
                .type("metadata-rest")
                .config(sinkConfig).build();
    }

    public static OpenMetadataIngestionComponent makeOpenMetadataConfigComponent(Ingestion ingestion,
                                                                                 AirflowConfiguration airflowConfiguration) {
        Map<String, Object> metadataConfig = new HashMap<>();
        metadataConfig.put("api_endpoint", airflowConfiguration.getMetadataApiEndpoint());
        metadataConfig.put("auth_provider_type",  airflowConfiguration.getAuthProvider());
        metadataConfig.put("secret_key", airflowConfiguration.getSecretKey());
        return OpenMetadataIngestionComponent.builder()
                .type("metadata-server")
                .config(metadataConfig).build();
    }

    public static OpenMetadataIngestionConfig buildDatabaseIngestion(Ingestion ingestion,
                                                                     AirflowConfiguration airflowConfiguration) {
        return  OpenMetadataIngestionConfig.builder()
                    .source(makeDatasourceComponent(ingestion))
                    .sink(makeOpenMetadataSinkComponent(ingestion))
                    .metadataServer(makeOpenMetadataConfigComponent(ingestion, airflowConfiguration)).build();

    }

    public static IngestionPipeline toIngestionPipeline(Ingestion ingestion,
                                                        AirflowConfiguration airflowConfiguration) {
        Map<String, Object> taskParams = new HashMap<>();
        taskParams.put("workflow_config", buildDatabaseIngestion(ingestion, airflowConfiguration));
        IngestionTaskConfig taskConfig  = IngestionTaskConfig.builder()
                .opKwargs(taskParams).build();
        OpenMetadataIngestionTask task = OpenMetadataIngestionTask.builder()
                .name(ingestion.getName())
                .config(taskConfig).build();
        List<OpenMetadataIngestionTask> taskList = new ArrayList<>();
        taskList.add(task);

        return IngestionPipeline.builder()
                .name(ingestion.getName())
                .description(ingestion.getDescription())
                .forceDeploy(ingestion.getForceDeploy())
                .pauseWorkflow(ingestion.getPauseWorkflow())
                .owner(ingestion.getOwner().getName())
                .schedulerInterval(ingestion.getScheduleInterval())
                .concurrency(ingestion.getConcurrency())
                .startDate(ingestion.getStartDate())
                .tasks(taskList).build();
    }
}