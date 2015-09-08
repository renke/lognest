import chai, {expect} from "chai"
import {spy, stub, mock, assert} from "sinon";

import bunyan from "bunyan";

import Logger from "../src/Logger";

describe("Logger", () => {
  let info;

  beforeEach(() => {
    info = mock();

    let createLogger = stub(bunyan, "createLogger");
    createLogger.returns({info});
  });

  afterEach(() => {
    bunyan.createLogger.restore();
  });

  it("should pass message and payload to Bunyan", () => {
    let logger = new Logger("logger");

    info.once().withExactArgs({a: 1}, "text")

    logger.info("text", {a: 1});

    info.verify();
  });
});
