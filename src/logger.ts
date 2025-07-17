export class Logger {
  private prefix: string;

  constructor(prefix: string = 'Claude-Gemini-Router') {
    this.prefix = prefix;
  }

  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.length > 0 ? ' ' + args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ') : '';
    
    return `[${timestamp}] [${this.prefix}] ${level.toUpperCase()}: ${message}${formattedArgs}`;
  }

  info(message: string, ...args: any[]) {
    console.log(this.formatMessage('info', message, ...args));
  }

  warn(message: string, ...args: any[]) {
    console.warn(this.formatMessage('warn', message, ...args));
  }

  error(message: string, ...args: any[]) {
    console.error(this.formatMessage('error', message, ...args));
  }

  debug(message: string, ...args: any[]) {
    console.log(this.formatMessage('debug', message, ...args));
  }
}

export const logger = new Logger();
