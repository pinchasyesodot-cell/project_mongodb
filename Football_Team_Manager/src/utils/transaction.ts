import { type ClientSession, startSession } from "mongoose";

export const withTransaction = async <T>(
    fn: (session: ClientSession) => Promise<T>,
): Promise<T> => {
    const session = await startSession();
    try {
        session.startTransaction();
        const result = await fn(session);
        await session.commitTransaction();
        return result;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};
