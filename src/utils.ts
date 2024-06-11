/* eslint-disable no-restricted-syntax */
import packageJson from '../package.json';
import compJson from '../component.json';

export const STORAGE_TYPE_PARAMETER = 'storage_type';
export const DEFAULT_STORAGE_TYPE = 'steward';
export const MAESTER_OBJECT_ID_ENDPOINT = '/objects/';
export const { ELASTICIO_OBJECT_STORAGE_TOKEN = '', ELASTICIO_OBJECT_STORAGE_URI = '' } = process.env;
export const maesterCreds = { jwtSecret: ELASTICIO_OBJECT_STORAGE_TOKEN, uri: ELASTICIO_OBJECT_STORAGE_URI };

export const getUserAgent = () => {
  const { name: compName } = packageJson;
  const { version: compVersion } = compJson;
  const maesterClientVersion = packageJson.dependencies['@elastic.io/maester-client'];
  return `${compName}/${compVersion} maester-client/${maesterClientVersion}`;
};

export const getMaesterAttachmentUrlById = (attachmentId): string => `${maesterCreds.uri}${MAESTER_OBJECT_ID_ENDPOINT}${attachmentId}?${STORAGE_TYPE_PARAMETER}=maester`;
