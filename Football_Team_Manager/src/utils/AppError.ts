export class AppError extends Error {
    public statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export class NotFound extends AppError {
    constructor(message: string) {
        super(message, 404)
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
