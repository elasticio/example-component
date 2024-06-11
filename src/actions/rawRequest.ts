import { messages } from 'elasticio-node';
import * as commons from '@elastic.io/component-commons-library';
import { getUserAgent } from '../utils';

export async function processAction(msg, cfg) {
  this.logger.info('"Make Raw Request" action started');

  const { url } = msg.body;
  const getStream = async () => {
    const fileStream = await commons.axiosReqWithRetryOnServerError.call({ logger: this.logger, cfg: {} }, {
      method: 'GET',
      url,
      responseType: 'stream'
    });
    this.logger.info('Got file data stream, start uploading to internal storage');
    return fileStream.data;
  };

  const attachmentProcessor = new commons.AttachmentProcessor(getUserAgent(), msg.id);

  const createdAttachmentId = await attachmentProcessor.uploadAttachment(getStream);
  const attachmentUrl = attachmentProcessor.getMaesterAttachmentUrlById(createdAttachmentId);
  this.logger.info('File saved to internal storage');
  const result = { attachmentUrl };

  return messages.newMessageWithBody(result);
}

module.exports.process = processAction;
