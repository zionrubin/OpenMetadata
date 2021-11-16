# Storage Service

This schema defines the Storage Service entity, such as S3, GCS, HDFS.

**$id:**[**https://open-metadata.org/schema/entity/services/storageService.json**](https://open-metadata.org/schema/entity/services/storageService.json)

Type: `object`

## Properties
- **id** `required`
  - Unique identifier of this storage service instance.
  - $ref: [../../type/basic.json#/definitions/uuid](../types/basic.md#uuid)
- **name** `required`
  - Name that identifies this storage service.
  - Type: `string`
  - Length: between 1 and 64
- **displayName**
  - Display Name that identifies this storage service.
  - Type: `string`
- **serviceType** `required`
  - Type of storage service such as S3, GCS, HDFS...
  - $ref: [#/definitions/storageServiceType](#storageservicetype)
- **description**
  - Description of a storage service instance.
  - Type: `string`
- **version**
  - Metadata version of the entity.
  - $ref: [../../type/entityHistory.json#/definitions/entityVersion](../types/entityhistory.md#entityversion)
- **updatedAt**
  - Last update time corresponding to the new version of the entity.
  - $ref: [../../type/basic.json#/definitions/dateTime](../types/basic.md#datetime)
- **updatedBy**
  - User who made the update.
  - Type: `string`
- **href** `required`
  - Link to the resource corresponding to this storage service.
  - $ref: [../../type/basic.json#/definitions/href](../types/basic.md#href)
- **changeDescription**
  - Change that lead to this version of the entity.
  - $ref: [../../type/entityHistory.json#/definitions/changeDescription](../types/entityhistory.md#changedescription)


## Type definitions in this schema

### storageServiceType

- Type of storage service such as S3, GCS, HDFS...
- Type: `string`
- The value is restricted to the following: 
  1. _"S3"_
  2. _"GCS"_
  3. _"HDFS"_

_This document was updated on: Monday, November 15, 2021_