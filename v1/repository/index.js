const mongooseClass = require('./mongoose');

const messagesRepository = new mongooseClass('messages', process.env.MONGO_URI);
const messagesLockTableRepository = new mongooseClass('messages_table_lock', process.env.MONGO_URI);
const messagesHistoryRepository = new mongooseClass('messages_history', process.env.MONGO_URI);

// const messagesRepositoryConnection = await repository.messagesRepository.connect();
// const messagesLockTableRepositoryConnection = await repository.messagesLockTableRepository.connect();
// const messagesHistoryRepositoryConnection = await repository.messagesHistoryRepository.connect();

module.exports = {
    messagesRepository,
    messagesLockTableRepository,
    messagesHistoryRepository
}