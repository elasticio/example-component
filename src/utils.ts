/* eslint-disable no-restricted-syntax */
import packageJson from '../package.json';
import compJson from '../component.json';

export const getUserAgent = () => {
  const { name: compName } = packageJson;
  const { version: compVersion } = compJson;
  const maesterClientVersion = packageJson.dependencies['@elastic.io/maester-client'];
  return `${compName}/${compVersion} maester-client/${maesterClientVersion}`;
};
