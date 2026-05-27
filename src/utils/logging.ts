export const logging = {
    debug: (msg: string, context?: object) => {
        if (process.env.LOG_LEVEL === 'debug') {
            console.error(JSON.stringify({
                ts: new Date().toISOString(), level: 'DEBUG', msg, ...context,
            }));
        }
    },
    info: (msg: string, context?: object) => {
        console.error(JSON.stringify({
            ts: new Date().toISOString(), level: 'INFO', msg, ...context,
        }));
    },
    warn: (msg: string, context?: object) => {
        console.error(JSON.stringify({
            ts: new Date().toISOString(), level: 'WARN', msg, ...context,
        }));
    },
    error: (msg: string, context?: object) => {
        console.error(JSON.stringify({
            ts: new Date().toISOString(), level: 'ERROR', msg, ...context,
        }));
    },
};