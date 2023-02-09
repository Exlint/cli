export abstract class AbstractLogger {
	public abstract info(input: string): void;
	public abstract success(input: string): void;
	public abstract warn(input: string): void;
	public abstract error(input: string): void;
}
