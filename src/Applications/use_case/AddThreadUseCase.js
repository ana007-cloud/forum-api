const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, owner) {
    // validate
    const addThread = new AddThread(useCasePayload);

    // send entity to repository
    return this._threadRepository.addThread(addThread, owner);
  }
}

module.exports = AddThreadUseCase;
