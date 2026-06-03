export default class BaseGateway {
  constructor({
    code,
    name,
    supportsWebhook = false,
    supportsPolling = false,
  }) {
    this.code = code;
    this.name = name;
    this.supportsWebhook = supportsWebhook;
    this.supportsPolling = supportsPolling;
  }

  describe() {
    return {
      code: this.code,
      name: this.name,
      supportsWebhook: this.supportsWebhook,
      supportsPolling: this.supportsPolling,
    };
  }

  async initiatePayment() {
    throw new Error("initiatePayment is not implemented");
  }

  async verifyPayment() {
    throw new Error("verifyPayment is not implemented");
  }

  async parseWebhook() {
    throw new Error("parseWebhook is not implemented");
  }
}
