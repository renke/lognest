import {pseudoRandomBytes} from "crypto";

const DEFAULT_CONTEXT_ID_SIZE = 16;

const DEFAULT_OPTIONS = {
    idKey: "contextId",
    idHeaderName: "X-Context-Id",

    adoptId: false,

    makeId() {
        return pseudoRandomBytes(DEFAULT_CONTEXT_ID_SIZE).toString("hex");
    },
}

let loggerMiddleware = (logger, userOptions={}) => {
  let options = Object.assign({}, DEFAULT_OPTIONS, userOptions);

  return (req, res, next) => {
    let contextId = req.headers[options.idHeaderName.toLowerCase()];

    if (!options.adoptId || !contextId || contextId == "") {
      contextId = options.makeId();
      req.headers[options.idHeaderName.toLowerCase()] = contextId;
    }

    logger.nest({[options.idKey]: contextId}, () => {
      logger.namespace.bindEmitter(req);
      logger.namespace.bindEmitter(res);

      next();
    });
  };
}

export default loggerMiddleware;
