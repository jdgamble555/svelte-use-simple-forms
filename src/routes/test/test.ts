class CustomObservable<T> {
    private observers: ((value: T) => void)[] = [];
    private value: T | null;

    constructor(initialValue: T | null = null) {
        this.value = initialValue;

    }

    subscribe(observer: (value: T) => void): () => void {
        this.observers.push(observer);

        if (this.value !== null && this.value !== undefined) {
            observer(this.value);
        }

        // Return an unsubscribe function
        return () => {
            const index = this.observers.indexOf(observer);
            if (index !== -1) {
                this.observers.splice(index, 1);
            }
        };
    }

    next(newValue: T): void {
        this.value = newValue;
        this.notifyObservers();
    }

    private notifyObservers(): void {
        if (this.value !== null) {
            for (const observer of this.observers) {
                observer(this.value);
            }
        }
    }
}


export const obs = new CustomObservable('pussy');