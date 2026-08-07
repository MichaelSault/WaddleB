let lockTail = Promise.resolve();
let activeOperation = null;
let waitingOperations = 0;

export function isYouTubeBusy() {
    return activeOperation !== null || waitingOperations > 0;
}

export async function withYouTubeLock(label, operation) {
    const previousOperation = lockTail;

    let releaseLock;

    lockTail = new Promise(resolve => {
        releaseLock = resolve;
    });

    if (isYouTubeBusy()) {
        console.log(
            `${label} queued behind another YouTube operation.`
        );
    }

    waitingOperations += 1;
    await previousOperation;
    waitingOperations -= 1;

    activeOperation = label;
    console.log(`Starting YouTube operation: ${label}`);

    try {
        return await operation();
    } finally {
        console.log(`Finished YouTube operation: ${label}`);
        activeOperation = null;
        releaseLock();
    }
}
