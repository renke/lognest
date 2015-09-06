import chai, {expect} from "chai"
import {spy, stub, mock, assert} from "sinon";

import Logger from "../Logger";

describe("Logger", () => {
  let info;

  beforeEach(() => {
    info = mock();

    let createLogger = stub();
    createLogger.returns({info});

    Logger.__Rewire__("bunyan", {
      createLogger,
      stdSerializers: {},
    });
  });

  afterEach(() => {
    Logger.__ResetDependency__("bunyan")
  });

  it("should pass message and payload to Bunyan", () => {
    let logger = new Logger("logger");

    info.once().withExactArgs({a: 1}, "text")

    logger.info("text", {a: 1});

    info.verify();
  });
});
