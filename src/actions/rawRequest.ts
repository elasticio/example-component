import { messages } from 'elasticio-node';
import { ObjectStorage } from '@elastic.io/maester-client';
import axios from 'axios';
import { getUserAgent, maesterCreds, getMaesterAttachmentUrlById } from '../utils';

export async function processAction(msg, cfg) {
  this.logger.info('"Make Raw Request" action started');

  const { url } = msg.body;
  const getStream = async () => {
    const fileStream = await axios({
      method: 'GET',
      url,
      responseType: 'stream'
    });
    this.logger.info('Got file data stream, start uploading to internal storage');
    return fileStream.data;
  };

  const objectStorage = new ObjectStorage({ ...maesterCreds, userAgent: getUserAgent() });

  const createdAttachmentId = await objectStorage.add(getStream, {
    headers: {},
    retryOptions: {
      requestTimeout: 20000,
      retriesCount: 2,
    },
  });

  const attachmentUrl = getMaesterAttachmentUrlById(createdAttachmentId);
  this.logger.info('File saved to internal storage');
  const result = { attachmentUrl };

  return messages.newMessageWithBody(result);
}

module.exports.process = processAction;
