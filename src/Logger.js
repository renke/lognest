import bunyan from "bunyan";
import {pseudoRandomBytes} from "crypto";
import {createNamespace, getNamespace} from "continuation-local-storage";

const LEVELS = ["fatal", "error", "warn", "info", "debug", "trace"];
const ID_LENGTH = 16

function makeId() {
  return pseudoRandomBytes(ID_LENGTH).toString("hex")
}

class Logger {
  constructor(name, options={}) {
    this.logger = options.logger

    if (!this.logger) {
      this.logger = bunyan.createLogger({
        name: name,
        serializers: bunyan.stdSerializers,
      });
    }

    this.namespace = options.namespace || createNamespace(makeId());

    this.loggerKey = makeId();

    LEVELS.forEach(level => {
      this[level] = this._message.bind(this, level);
    })
  }

  nest(payload={}, context) {
    this.namespace.run(() => {
      this.namespace.set(this.loggerKey, this.currentLogger.child(payload));
      context();
    })
  }

  get currentLogger() {
    return this.namespace.get(this.loggerKey) || this.logger;
  }

  _message(level, text, payload={}) {
    this.currentLogger[level](payload, text);
  }
}

export default Logger;
