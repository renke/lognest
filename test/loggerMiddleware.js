import {expect} from "chai"

import {EventEmitter} from "events";
import {spy, stub, mock, assert} from "sinon";

import bunyan from "bunyan";

import Logger from "../src/Logger";
import loggerMiddleware from "../src/loggerMiddleware"

describe("loggerMiddleware", () => {
  let logger; // Unit under test
  let options;

  let info; // bunyan.createLogger()#info

  let req;
  let res;

  beforeEach(() => {
    info = mock();
    let createLogger = stub(bunyan, "createLogger");

    let child = payload => {
      return {info, child, payload, };
    }

    createLogger.returns({info, child});
  });

  afterEach(() => {
    bunyan.createLogger.restore();
  });

  beforeEach(() => {
    logger = new Logger("test");

    options = {
      idKey: "id",
      idHeaderName: "X-Context-Id",

      makeId () {
          return "id"
      },
    }

    req = new EventEmitter();
    req.headers = {};

    res = new EventEmitter();
  });

  it("should log context id", () => {
    loggerMiddleware(logger, options)(req, res, () => {
      expect(logger.currentLogger.payload).to.deep.equal({id: "id"});
    });
  })

  it("should not use existing context id from header by default", () => {
    const existingId = "existingId"
    req.headers = {[options.idHeaderName.toLowerCase()]: existingId};

    loggerMiddleware(logger, options)(req, res, () => {
      expect(logger.currentLogger.payload).to.deep.equal({id: "id"});
    });
  })

  it("should use existing context id from header as per options", () => {
    options.adoptId = true;

    const existingId = "existingId"
    req.headers = {[options.idHeaderName.toLowerCase()]: existingId};

    loggerMiddleware(logger, options)(req, res, () => {
      expect(logger.currentLogger.payload).to.deep.equal({id: existingId});
    });
  })

  it("should set context id header", () => {
    const existingId = "existingId"

    loggerMiddleware(logger, options)(req, res, () => {
      const contextId = req.headers[options.idHeaderName.toLowerCase()]
      expect(contextId).to.equal("id");
    });
  })

  it("should bind req and res event emitters", () => {
    loggerMiddleware(logger, options)(req, res, () => {
      req.on("event", () => {
        expect(logger.currentLogger.payload).to.deep.equal({id: "id"});
      })
    });

    req.emit("event");
  })
});
