// @ts-nocheck — Vendored Viostream embed API source (development ESM build).
//
// This file is an unmodified copy of the upstream Viostream embed API ESM
// bundle. No patches are applied — the `config()` function natively reads
// `window.playerDomain` for host resolution and defaults to
// `play.viostream.com`.
//
// When updating this file from a new upstream build, replace the content
// below the `/* eslint-disable */` pragma. No manual patches required.

/* eslint-disable */

const byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}
let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    if (typeof crypto === "undefined" || !crypto.getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
    getRandomValues = crypto.getRandomValues.bind(crypto);
  }
  return getRandomValues(rnds8);
}
const randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
const native = { randomUUID };
function v4(options, buf, offset) {
  if (native.randomUUID && true && !options) {
    return native.randomUUID();
  }
  options = options || {};
  const rnds = options.random ?? options.rng?.() ?? rng();
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  return unsafeStringify(rnds);
}
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
function getAugmentedNamespace(n) {
  if (Object.prototype.hasOwnProperty.call(n, "__esModule")) return n;
  var f = n.default;
  if (typeof f == "function") {
    var a = function a2() {
      var isInstance = false;
      try {
        isInstance = this instanceof a2;
      } catch {
      }
      if (isInstance) {
        return Reflect.construct(f, arguments, this.constructor);
      }
      return f.apply(this, arguments);
    };
    a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, "__esModule", { value: true });
  Object.keys(n).forEach(function(k) {
    var d = Object.getOwnPropertyDescriptor(n, k);
    Object.defineProperty(a, k, d.get ? d : {
      enumerable: true,
      get: function() {
        return n[k];
      }
    });
  });
  return a;
}
const __viteBrowserExternal = {};
const __viteBrowserExternal$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: __viteBrowserExternal
}, Symbol.toStringTag, { value: "Module" }));
const require$$0 = /* @__PURE__ */ getAugmentedNamespace(__viteBrowserExternal$1);
var document_1;
var hasRequiredDocument;
function requireDocument() {
  if (hasRequiredDocument) return document_1;
  hasRequiredDocument = 1;
  var topLevel = typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof window !== "undefined" ? window : {};
  var minDoc = require$$0;
  var doccy;
  if (typeof document !== "undefined") {
    doccy = document;
  } else {
    doccy = topLevel["__GLOBAL_DOCUMENT_CACHE@4"];
    if (!doccy) {
      doccy = topLevel["__GLOBAL_DOCUMENT_CACHE@4"] = minDoc;
    }
  }
  document_1 = doccy;
  return document_1;
}
var documentExports = requireDocument();
const document$1 = /* @__PURE__ */ getDefaultExportFromCjs(documentExports);
const determineMaxWidth = (aspectRatio, maxHeight = 0) => {
  if (aspectRatio < 0.6) {
    maxHeight = 640;
  } else if (aspectRatio < 1.1) {
    maxHeight = 480;
  }
  maxHeight = maxHeight == 0 ? 0 : maxHeight;
  const maxWidth = maxHeight * aspectRatio;
  return maxWidth;
};
var window_1;
var hasRequiredWindow;
function requireWindow() {
  if (hasRequiredWindow) return window_1;
  hasRequiredWindow = 1;
  var win;
  if (typeof window !== "undefined") {
    win = window;
  } else if (typeof commonjsGlobal !== "undefined") {
    win = commonjsGlobal;
  } else if (typeof self !== "undefined") {
    win = self;
  } else {
    win = {};
  }
  window_1 = win;
  return window_1;
}
var windowExports = requireWindow();
const window$1 = /* @__PURE__ */ getDefaultExportFromCjs(windowExports);
const defaultPLayerDomain = "play.viostream.com";
function config() {
  return {
    location: window$1 && window$1.location ? window$1.location.href : null,
    playerDomain: (window$1 && window$1.playerDomain) ?? defaultPLayerDomain,
    trackerParamsOverride: window$1 && window$1.trackerParams ? window$1.trackerParams : null,
    isLocal: window$1 && window$1.location && window$1.location.host && window$1.location.host.indexOf("localhost") !== -1,
    editorMode: window$1 && window$1.editorMode ? window$1.editorMode : false
  };
}
const GenerateFrameUrl = (embedKey, playerSettings, embedId) => {
  const { playerDomain, trackerParamsOverride } = config();
  if (trackerParamsOverride) {
    playerSettings.trackerParams = trackerParamsOverride;
  }
  const payload = btoa(JSON.stringify(playerSettings));
  let frameUrl = `https://${playerDomain}/iframe/${embedKey}?payload=${payload}`;
  if (playerSettings.playerKey) {
    frameUrl = `${frameUrl}&playerKey=${playerSettings.playerKey}`;
  }
  if (embedId) {
    frameUrl = `${frameUrl}&embedId=${embedId}`;
  }
  return frameUrl;
};
const writeInnerTarget = (targetId, aspectRatio, maxHeight) => {
  const maxWidth = determineMaxWidth(aspectRatio, maxHeight);
  const innerTargetId = `${targetId}-inner`;
  const innerTarget = document$1.createElement("div");
  innerTarget.id = innerTargetId;
  innerTarget.style.width = "100%";
  innerTarget.style.position = "relative";
  innerTarget.style.margin = "0 auto";
  if (maxWidth > 0)
    innerTarget.style.maxWidth = `${maxWidth}px`;
  return innerTarget;
};
const frameWriter = (embedKey, targetId, playerSettings, forceAspectRatio = void 0, maxHeight = 0) => {
  const embedId = `viostream-player-${embedKey}-${v4()}`.toLocaleLowerCase();
  const frameUrl = GenerateFrameUrl(embedKey, playerSettings, embedId);
  const aspectRatio = forceAspectRatio || 1.7778;
  let padding = `${Number.isNaN(aspectRatio) ? 56.25 : 1 / aspectRatio * 100}%`;
  if (playerSettings.playerStyle === "audio") {
    padding = "98px";
  }
  const target = document$1.getElementById(targetId);
  const innerTarget = writeInnerTarget(targetId, aspectRatio, maxHeight);
  target.appendChild(innerTarget);
  const playerContainer = document$1.createElement("div");
  playerContainer.id = `${embedId}-container`;
  if (forceAspectRatio)
    playerContainer.dataset.aspectRatioForced = forceAspectRatio;
  playerContainer.setAttribute("style", `width:100%; padding-top: ${padding}; position: relative;`);
  innerTarget.appendChild(playerContainer);
  const playerFrame = document$1.createElement("iframe");
  playerFrame.setAttribute("src", frameUrl);
  playerFrame.setAttribute("style", "position: absolute; top:0; left:0; border-radius:8px");
  playerFrame.setAttribute("width", "100%");
  playerFrame.setAttribute("height", "100%");
  playerFrame.setAttribute("frameborder", "0");
  playerFrame.setAttribute("id", embedId);
  playerFrame.setAttribute("allowfullscreen", "");
  playerFrame.setAttribute("title", "Viostream Player");
  playerFrame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  playerFrame.setAttribute("allow", "autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope; magnetometer");
  playerContainer.appendChild(playerFrame);
  const params = {
    container: playerContainer,
    inner: innerTarget,
    el: playerFrame,
    embedId,
    url: frameUrl
  };
  return params;
};
var PenpalError = class extends Error {
  code;
  constructor(code, message) {
    super(message);
    this.name = "PenpalError";
    this.code = code;
  }
};
var PenpalError_default = PenpalError;
var serializeError = (error) => ({
  name: error.name,
  message: error.message,
  stack: error.stack,
  penpalCode: error instanceof PenpalError_default ? error.code : void 0
});
var deserializeError = ({
  name,
  message,
  stack,
  penpalCode
}) => {
  const deserializedError = penpalCode ? new PenpalError_default(penpalCode, message) : new Error(message);
  deserializedError.name = name;
  deserializedError.stack = stack;
  return deserializedError;
};
var brand = /* @__PURE__ */ Symbol("Reply");
var Reply = class {
  value;
  transferables;
  // Allows TypeScript to distinguish between an actual instance of this
  // class versus an object that looks structurally similar.
  // eslint-disable-next-line no-unused-private-class-members
  #brand = brand;
  constructor(value, options) {
    this.value = value;
    this.transferables = options?.transferables;
  }
};
var Reply_default = Reply;
var namespace_default = "penpal";
var isObject = (value) => {
  return typeof value === "object" && value !== null;
};
var isFunction = (value) => {
  return typeof value === "function";
};
var isMessage = (data) => {
  return isObject(data) && data.namespace === namespace_default;
};
var isSynMessage = (message) => {
  return message.type === "SYN";
};
var isAck1Message = (message) => {
  return message.type === "ACK1";
};
var isAck2Message = (message) => {
  return message.type === "ACK2";
};
var isCallMessage = (message) => {
  return message.type === "CALL";
};
var isReplyMessage = (message) => {
  return message.type === "REPLY";
};
var isDestroyMessage = (message) => {
  return message.type === "DESTROY";
};
var extractMethodPathsFromMethods = (methods, currentPath = []) => {
  const methodPaths = [];
  for (const key of Object.keys(methods)) {
    const value = methods[key];
    if (isFunction(value)) {
      methodPaths.push([...currentPath, key]);
    } else if (isObject(value)) {
      methodPaths.push(
        ...extractMethodPathsFromMethods(value, [...currentPath, key])
      );
    }
  }
  return methodPaths;
};
var getMethodAtMethodPath = (methodPath, methods) => {
  const result = methodPath.reduce(
    (acc, pathSegment) => {
      return isObject(acc) ? acc[pathSegment] : void 0;
    },
    methods
  );
  return isFunction(result) ? result : void 0;
};
var formatMethodPath = (methodPath) => {
  return methodPath.join(".");
};
var createErrorReplyMessage = (channel, callId, error) => ({
  namespace: namespace_default,
  channel,
  type: "REPLY",
  callId,
  isError: true,
  ...error instanceof Error ? { value: serializeError(error), isSerializedErrorInstance: true } : { value: error }
});
var connectCallHandler = (messenger, methods, channel, log) => {
  let isDestroyed = false;
  const handleMessage = async (message) => {
    if (isDestroyed) {
      return;
    }
    if (!isCallMessage(message)) {
      return;
    }
    log?.(`Received ${formatMethodPath(message.methodPath)}() call`, message);
    const { methodPath, args, id: callId } = message;
    let replyMessage;
    let transferables;
    try {
      const method = getMethodAtMethodPath(methodPath, methods);
      if (!method) {
        throw new PenpalError_default(
          "METHOD_NOT_FOUND",
          `Method \`${formatMethodPath(methodPath)}\` is not found.`
        );
      }
      let value = await method(...args);
      if (value instanceof Reply_default) {
        transferables = value.transferables;
        value = await value.value;
      }
      replyMessage = {
        namespace: namespace_default,
        channel,
        type: "REPLY",
        callId,
        value
      };
    } catch (error) {
      replyMessage = createErrorReplyMessage(channel, callId, error);
    }
    if (isDestroyed) {
      return;
    }
    try {
      log?.(`Sending ${formatMethodPath(methodPath)}() reply`, replyMessage);
      messenger.sendMessage(replyMessage, transferables);
    } catch (error) {
      if (error.name === "DataCloneError") {
        replyMessage = createErrorReplyMessage(channel, callId, error);
        log?.(`Sending ${formatMethodPath(methodPath)}() reply`, replyMessage);
        messenger.sendMessage(replyMessage);
      }
      throw error;
    }
  };
  messenger.addMessageHandler(handleMessage);
  return () => {
    isDestroyed = true;
    messenger.removeMessageHandler(handleMessage);
  };
};
var connectCallHandler_default = connectCallHandler;
var generateId_default = crypto.randomUUID?.bind(crypto) ?? (() => new Array(4).fill(0).map(
  () => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)
).join("-"));
var brand2 = /* @__PURE__ */ Symbol("CallOptions");
var CallOptions = class {
  transferables;
  timeout;
  // Allows TypeScript to distinguish between an actual instance of this
  // class versus an object that looks structurally similar.
  // eslint-disable-next-line no-unused-private-class-members
  #brand = brand2;
  constructor(options) {
    this.transferables = options?.transferables;
    this.timeout = options?.timeout;
  }
};
var CallOptions_default = CallOptions;
var methodsToTreatAsNative = /* @__PURE__ */ new Set(["apply", "call", "bind"]);
var createRemoteProxy = (callback, log, path = []) => {
  return new Proxy(
    path.length ? () => {
    } : /* @__PURE__ */ Object.create(null),
    {
      get(target, prop) {
        if (prop === "then") {
          return;
        }
        if (path.length && methodsToTreatAsNative.has(prop)) {
          return Reflect.get(target, prop);
        }
        return createRemoteProxy(callback, log, [...path, prop]);
      },
      apply(target, _thisArg, args) {
        return callback(path, args);
      }
    }
  );
};
var getDestroyedConnectionMethodCallError = (methodPath) => {
  return new PenpalError_default(
    "CONNECTION_DESTROYED",
    `Method call ${formatMethodPath(
      methodPath
    )}() failed due to destroyed connection`
  );
};
var connectRemoteProxy = (messenger, channel, log) => {
  let isDestroyed = false;
  const replyHandlers = /* @__PURE__ */ new Map();
  const handleMessage = (message) => {
    if (!isReplyMessage(message)) {
      return;
    }
    const { callId, value, isError, isSerializedErrorInstance } = message;
    const replyHandler = replyHandlers.get(callId);
    if (!replyHandler) {
      return;
    }
    replyHandlers.delete(callId);
    log?.(
      `Received ${formatMethodPath(replyHandler.methodPath)}() call`,
      message
    );
    if (isError) {
      replyHandler.reject(
        isSerializedErrorInstance ? deserializeError(value) : value
      );
    } else {
      replyHandler.resolve(value);
    }
  };
  messenger.addMessageHandler(handleMessage);
  const remoteProxy = createRemoteProxy((methodPath, args) => {
    if (isDestroyed) {
      throw getDestroyedConnectionMethodCallError(methodPath);
    }
    const callId = generateId_default();
    const lastArg = args[args.length - 1];
    const lastArgIsOptions = lastArg instanceof CallOptions_default;
    const { timeout, transferables } = lastArgIsOptions ? lastArg : {};
    const argsWithoutOptions = lastArgIsOptions ? args.slice(0, -1) : args;
    return new Promise((resolve, reject) => {
      const timeoutId = timeout !== void 0 ? window.setTimeout(() => {
        replyHandlers.delete(callId);
        reject(
          new PenpalError_default(
            "METHOD_CALL_TIMEOUT",
            `Method call ${formatMethodPath(
              methodPath
            )}() timed out after ${timeout}ms`
          )
        );
      }, timeout) : void 0;
      replyHandlers.set(callId, { methodPath, resolve, reject, timeoutId });
      try {
        const callMessage = {
          namespace: namespace_default,
          channel,
          type: "CALL",
          id: callId,
          methodPath,
          args: argsWithoutOptions
        };
        log?.(`Sending ${formatMethodPath(methodPath)}() call`, callMessage);
        messenger.sendMessage(callMessage, transferables);
      } catch (error) {
        reject(
          new PenpalError_default("TRANSMISSION_FAILED", error.message)
        );
      }
    });
  }, log);
  const destroy = () => {
    isDestroyed = true;
    messenger.removeMessageHandler(handleMessage);
    for (const { methodPath, reject, timeoutId } of replyHandlers.values()) {
      clearTimeout(timeoutId);
      reject(getDestroyedConnectionMethodCallError(methodPath));
    }
    replyHandlers.clear();
  };
  return {
    remoteProxy,
    destroy
  };
};
var connectRemoteProxy_default = connectRemoteProxy;
var getPromiseWithResolvers = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {
    promise,
    resolve,
    reject
  };
};
var getPromiseWithResolvers_default = getPromiseWithResolvers;
var DEPRECATED_PENPAL_PARTICIPANT_ID = "deprecated-penpal";
var isDeprecatedMessage = (data) => {
  return isObject(data) && "penpal" in data;
};
var upgradeMethodPath = (methodPath) => methodPath.split(".");
var downgradeMethodPath = (methodPath) => methodPath.join(".");
var stringifyUnknownMessage = (message) => {
  try {
    return JSON.stringify(message);
  } catch (_) {
    return String(message);
  }
};
var getUnexpectedMessageError = (message) => {
  return new PenpalError_default(
    "TRANSMISSION_FAILED",
    `Unexpected message to translate: ${stringifyUnknownMessage(message)}`
  );
};
var upgradeMessage = (message) => {
  if (message.penpal === "syn") {
    return {
      namespace: namespace_default,
      channel: void 0,
      type: "SYN",
      participantId: DEPRECATED_PENPAL_PARTICIPANT_ID
    };
  }
  if (message.penpal === "ack") {
    return {
      namespace: namespace_default,
      channel: void 0,
      type: "ACK2"
    };
  }
  if (message.penpal === "call") {
    return {
      namespace: namespace_default,
      channel: void 0,
      type: "CALL",
      // Actually converting the ID to a string would break communication.
      id: message.id,
      methodPath: upgradeMethodPath(message.methodName),
      args: message.args
    };
  }
  if (message.penpal === "reply") {
    if (message.resolution === "fulfilled") {
      return {
        namespace: namespace_default,
        channel: void 0,
        type: "REPLY",
        // Actually converting the ID to a string would break communication.
        callId: message.id,
        value: message.returnValue
      };
    } else {
      return {
        namespace: namespace_default,
        channel: void 0,
        type: "REPLY",
        // Actually converting the ID to a string would break communication.
        callId: message.id,
        isError: true,
        ...message.returnValueIsError ? {
          value: message.returnValue,
          isSerializedErrorInstance: true
        } : {
          value: message.returnValue
        }
      };
    }
  }
  throw getUnexpectedMessageError(message);
};
var downgradeMessage = (message) => {
  if (isAck1Message(message)) {
    return {
      penpal: "synAck",
      methodNames: message.methodPaths.map(downgradeMethodPath)
    };
  }
  if (isCallMessage(message)) {
    return {
      penpal: "call",
      // Actually converting the ID to a number would break communication.
      id: message.id,
      methodName: downgradeMethodPath(message.methodPath),
      args: message.args
    };
  }
  if (isReplyMessage(message)) {
    if (message.isError) {
      return {
        penpal: "reply",
        // Actually converting the ID to a number would break communication.
        id: message.callId,
        resolution: "rejected",
        ...message.isSerializedErrorInstance ? {
          returnValue: message.value,
          returnValueIsError: true
        } : { returnValue: message.value }
      };
    } else {
      return {
        penpal: "reply",
        // Actually converting the ID to a number would break communication.
        id: message.callId,
        resolution: "fulfilled",
        returnValue: message.value
      };
    }
  }
  throw getUnexpectedMessageError(message);
};
var shakeHands = ({
  messenger,
  methods,
  timeout,
  channel,
  log
}) => {
  const participantId = generateId_default();
  let remoteParticipantId;
  const destroyHandlers = [];
  let isComplete = false;
  const methodPaths = extractMethodPathsFromMethods(methods);
  const { promise, resolve, reject } = getPromiseWithResolvers_default();
  const timeoutId = timeout !== void 0 ? setTimeout(() => {
    reject(
      new PenpalError_default(
        "CONNECTION_TIMEOUT",
        `Connection timed out after ${timeout}ms`
      )
    );
  }, timeout) : void 0;
  const destroy = () => {
    for (const destroyHandler of destroyHandlers) {
      destroyHandler();
    }
  };
  const connectCallHandlerAndMethodProxies = () => {
    if (isComplete) {
      return;
    }
    destroyHandlers.push(connectCallHandler_default(messenger, methods, channel, log));
    const { remoteProxy, destroy: destroyMethodProxies } = connectRemoteProxy_default(messenger, channel, log);
    destroyHandlers.push(destroyMethodProxies);
    clearTimeout(timeoutId);
    isComplete = true;
    resolve({
      remoteProxy,
      destroy
    });
  };
  const sendSynMessage = () => {
    const synMessage = {
      namespace: namespace_default,
      type: "SYN",
      channel,
      participantId
    };
    log?.(`Sending handshake SYN`, synMessage);
    try {
      messenger.sendMessage(synMessage);
    } catch (error) {
      reject(new PenpalError_default("TRANSMISSION_FAILED", error.message));
    }
  };
  const handleSynMessage = (message) => {
    log?.(`Received handshake SYN`, message);
    if (message.participantId === remoteParticipantId && // TODO: Used for backward-compatibility. Remove in next major version.
    remoteParticipantId !== DEPRECATED_PENPAL_PARTICIPANT_ID) {
      return;
    }
    remoteParticipantId = message.participantId;
    sendSynMessage();
    const isHandshakeLeader = participantId > remoteParticipantId || // TODO: Used for backward-compatibility. Remove in next major version.
    remoteParticipantId === DEPRECATED_PENPAL_PARTICIPANT_ID;
    if (!isHandshakeLeader) {
      return;
    }
    const ack1Message = {
      namespace: namespace_default,
      channel,
      type: "ACK1",
      methodPaths
    };
    log?.(`Sending handshake ACK1`, ack1Message);
    try {
      messenger.sendMessage(ack1Message);
    } catch (error) {
      reject(new PenpalError_default("TRANSMISSION_FAILED", error.message));
      return;
    }
  };
  const handleAck1Message = (message) => {
    log?.(`Received handshake ACK1`, message);
    const ack2Message = {
      namespace: namespace_default,
      channel,
      type: "ACK2"
    };
    log?.(`Sending handshake ACK2`, ack2Message);
    try {
      messenger.sendMessage(ack2Message);
    } catch (error) {
      reject(new PenpalError_default("TRANSMISSION_FAILED", error.message));
      return;
    }
    connectCallHandlerAndMethodProxies();
  };
  const handleAck2Message = (message) => {
    log?.(`Received handshake ACK2`, message);
    connectCallHandlerAndMethodProxies();
  };
  const handleMessage = (message) => {
    if (isSynMessage(message)) {
      handleSynMessage(message);
    }
    if (isAck1Message(message)) {
      handleAck1Message(message);
    }
    if (isAck2Message(message)) {
      handleAck2Message(message);
    }
  };
  messenger.addMessageHandler(handleMessage);
  destroyHandlers.push(() => messenger.removeMessageHandler(handleMessage));
  sendSynMessage();
  return promise;
};
var shakeHands_default = shakeHands;
var once = (fn) => {
  let isCalled = false;
  let result;
  return (...args) => {
    if (!isCalled) {
      isCalled = true;
      result = fn(...args);
    }
    return result;
  };
};
var once_default = once;
var usedMessengers = /* @__PURE__ */ new WeakSet();
var connect = ({
  messenger,
  methods = {},
  timeout,
  channel,
  log
}) => {
  if (!messenger) {
    throw new PenpalError_default("INVALID_ARGUMENT", "messenger must be defined");
  }
  if (usedMessengers.has(messenger)) {
    throw new PenpalError_default(
      "INVALID_ARGUMENT",
      "A messenger can only be used for a single connection"
    );
  }
  usedMessengers.add(messenger);
  const connectionDestroyedHandlers = [messenger.destroy];
  const destroyConnection = once_default((notifyOtherParticipant) => {
    if (notifyOtherParticipant) {
      const destroyMessage = {
        namespace: namespace_default,
        channel,
        type: "DESTROY"
      };
      try {
        messenger.sendMessage(destroyMessage);
      } catch (_) {
      }
    }
    for (const connectionDestroyedHandler of connectionDestroyedHandlers) {
      connectionDestroyedHandler();
    }
    log?.("Connection destroyed");
  });
  const validateReceivedMessage = (data) => {
    return isMessage(data) && data.channel === channel;
  };
  const promise = (async () => {
    try {
      messenger.initialize({ log, validateReceivedMessage });
      messenger.addMessageHandler((message) => {
        if (isDestroyMessage(message)) {
          destroyConnection(false);
        }
      });
      const { remoteProxy, destroy } = await shakeHands_default({
        messenger,
        methods,
        timeout,
        channel,
        log
      });
      connectionDestroyedHandlers.push(destroy);
      return remoteProxy;
    } catch (error) {
      destroyConnection(true);
      throw error;
    }
  })();
  return {
    promise,
    // Why we don't reject the connection promise when consumer calls destroy():
    // https://github.com/Aaronius/penpal/issues/51
    destroy: () => {
      destroyConnection(true);
    }
  };
};
var connect_default = connect;
var WindowMessenger = class {
  #remoteWindow;
  #allowedOrigins;
  #log;
  #validateReceivedMessage;
  #concreteRemoteOrigin;
  #messageCallbacks = /* @__PURE__ */ new Set();
  #port;
  // TODO: Used for backward-compatibility. Remove in next major version.
  #isChildUsingDeprecatedProtocol = false;
  constructor({ remoteWindow, allowedOrigins }) {
    if (!remoteWindow) {
      throw new PenpalError_default("INVALID_ARGUMENT", "remoteWindow must be defined");
    }
    this.#remoteWindow = remoteWindow;
    this.#allowedOrigins = allowedOrigins?.length ? allowedOrigins : [window.origin];
  }
  initialize = ({
    log,
    validateReceivedMessage
  }) => {
    this.#log = log;
    this.#validateReceivedMessage = validateReceivedMessage;
    window.addEventListener("message", this.#handleMessageFromRemoteWindow);
  };
  sendMessage = (message, transferables) => {
    if (isSynMessage(message)) {
      const originForSending = this.#getOriginForSendingMessage(message);
      this.#remoteWindow.postMessage(message, {
        targetOrigin: originForSending,
        transfer: transferables
      });
      return;
    }
    if (isAck1Message(message) || // If the child is using a previous version of Penpal, we need to
    // downgrade the message and send it through the window rather than
    // the port because older versions of Penpal don't use MessagePorts.
    this.#isChildUsingDeprecatedProtocol) {
      const payload = this.#isChildUsingDeprecatedProtocol ? downgradeMessage(message) : message;
      const originForSending = this.#getOriginForSendingMessage(message);
      this.#remoteWindow.postMessage(payload, {
        targetOrigin: originForSending,
        transfer: transferables
      });
      return;
    }
    if (isAck2Message(message)) {
      const { port1, port2 } = new MessageChannel();
      this.#port = port1;
      port1.addEventListener("message", this.#handleMessageFromPort);
      port1.start();
      const transferablesToSend = [port2, ...transferables || []];
      const originForSending = this.#getOriginForSendingMessage(message);
      this.#remoteWindow.postMessage(message, {
        targetOrigin: originForSending,
        transfer: transferablesToSend
      });
      return;
    }
    if (this.#port) {
      this.#port.postMessage(message, {
        transfer: transferables
      });
      return;
    }
    throw new PenpalError_default(
      "TRANSMISSION_FAILED",
      "Cannot send message because the MessagePort is not connected"
    );
  };
  addMessageHandler = (callback) => {
    this.#messageCallbacks.add(callback);
  };
  removeMessageHandler = (callback) => {
    this.#messageCallbacks.delete(callback);
  };
  destroy = () => {
    window.removeEventListener("message", this.#handleMessageFromRemoteWindow);
    this.#destroyPort();
    this.#messageCallbacks.clear();
  };
  #isAllowedOrigin = (origin) => {
    return this.#allowedOrigins.some(
      (allowedOrigin) => allowedOrigin instanceof RegExp ? allowedOrigin.test(origin) : allowedOrigin === origin || allowedOrigin === "*"
    );
  };
  #getOriginForSendingMessage = (message) => {
    if (isSynMessage(message)) {
      return "*";
    }
    if (!this.#concreteRemoteOrigin) {
      throw new PenpalError_default(
        "TRANSMISSION_FAILED",
        "Cannot send message because the remote origin is not established"
      );
    }
    return this.#concreteRemoteOrigin === "null" && this.#allowedOrigins.includes("*") ? "*" : this.#concreteRemoteOrigin;
  };
  #destroyPort = () => {
    this.#port?.removeEventListener("message", this.#handleMessageFromPort);
    this.#port?.close();
    this.#port = void 0;
  };
  #handleMessageFromRemoteWindow = ({
    source,
    origin,
    ports,
    data
  }) => {
    if (source !== this.#remoteWindow) {
      return;
    }
    if (isDeprecatedMessage(data)) {
      this.#log?.(
        "Please upgrade the child window to the latest version of Penpal."
      );
      this.#isChildUsingDeprecatedProtocol = true;
      try {
        data = upgradeMessage(data);
      } catch (error) {
        this.#log?.(
          `Failed to translate deprecated message: ${error.message}`
        );
        return;
      }
    }
    if (!this.#validateReceivedMessage?.(data)) {
      return;
    }
    if (!this.#isAllowedOrigin(origin)) {
      this.#log?.(
        `Received a message from origin \`${origin}\` which did not match allowed origins \`[${this.#allowedOrigins.join(", ")}]\``
      );
      return;
    }
    if (isSynMessage(data)) {
      this.#destroyPort();
      this.#concreteRemoteOrigin = origin;
    }
    if (isAck2Message(data) && // Previous versions of Penpal don't use MessagePorts and do all
    // communication through the window.
    !this.#isChildUsingDeprecatedProtocol) {
      this.#port = ports[0];
      if (!this.#port) {
        this.#log?.("Ignoring ACK2 because it did not include a MessagePort");
        return;
      }
      this.#port.addEventListener("message", this.#handleMessageFromPort);
      this.#port.start();
    }
    for (const callback of this.#messageCallbacks) {
      callback(data);
    }
  };
  #handleMessageFromPort = ({ data }) => {
    if (!this.#validateReceivedMessage?.(data)) {
      return;
    }
    for (const callback of this.#messageCallbacks) {
      callback(data);
    }
  };
};
var WindowMessenger_default = WindowMessenger;
var debug = (prefix) => {
  return (...args) => {
    console.log(`\u270d\ufe0f %c${prefix}%c`, "font-weight: bold;", "", ...args);
  };
};
var debug_default = debug;
class PlayerCommandApi {
  /**
   * @param {any} frame
   */
  constructor(frame, playerSettings) {
    this.frame = frame;
    this.playerSettings = playerSettings;
    this.remote = void 0;
    this.events = {};
    const { playerDomain, isLocal } = config();
    let debugMode = isLocal;
    const messenger = new WindowMessenger_default({
      remoteWindow: frame.el.contentWindow,
      allowedOrigins: [`https://${playerDomain}`]
    });
    let cachedThis = this;
    this.connection = connect_default({
      messenger,
      channel: frame.embedId,
      log: debugMode ? debug_default("parent") : null,
      // Methods the parent window is exposing to the iframe window.
      methods: {
        emit(event, data) {
          if (event in cachedThis.events) {
            cachedThis.events[event].forEach((callback) => {
              callback.call(this, data);
            });
          }
        }
      }
    });
    this.remoteConnect();
  }
  _call(method, value) {
    this.remote[method](value);
  }
  _get(method, callback) {
    this.remote[method]().then((value) => {
      callback(value);
    });
  }
  remoteConnect() {
    let cachedThis = this;
    if (!this.remote) {
      this.connection.promise.then((remote) => {
        cachedThis.remote = remote;
      });
    }
  }
  /** Plays the current loaded media. */
  play() {
    this._call("play");
  }
  /**  Pause the current loaded media. */
  pause() {
    this._call("pause");
  }
  /** Mute the current loaded media. */
  mute() {
    this._call("mute");
  }
  /** Unmute the current loaded media. */
  unmute() {
    this._call("unmute");
  }
  /**
   * Get the current volume level.
   * @param {function} callback
   */
  getVolume(callback) {
    this._get("getVolume", callback);
  }
  /**
   * Set the volume level
   * @param {Number} value
   */
  setVolume(value) {
    this._call("setVolume", value);
  }
  /**
   * Get the current loop state.
   * @param {function} callback
   */
  getLoop(callback) {
    this._get("getLoop", callback);
  }
  /**
   * Set the loop state.
   * @param {Boolean} value
   */
  setLoop(value) {
    this._call("setLoop", value);
  }
  /**
   * Get the current time in seconds.
   * @param {any} callback
   */
  getCurrentTime(callback) {
    this._get("getCurrentTime", callback);
  }
  /** Set the current time in seconds 
   *  @param {number} seconds 
  */
  setCurrentTime(seconds, play) {
    this._call("setCurrentTime", { seconds, play });
  }
  /** Get the current paused state. 
   * @param {function} callback 
  */
  getPaused(callback) {
    this._get("getPaused", callback);
  }
  /** Get the current media's duration. 
   * @param {function} callback
  */
  getDuration(callback) {
    this._get("getDuration", callback);
  }
  /** Get the current muted state. 
   * @param {function} callback   
  */
  getMuted(callback) {
    this._get("getMuted", callback);
  }
  /** Get the current aspect ratio 
   * @param {function } callback
  */
  getAspectRatio(callback) {
    this._get("getAspectRatio", callback);
  }
  /** private api 
   * Get the current time for live streams in seconds.
   * @param {function } callback
  */
  getLiveCurrentTime(callback) {
    this._get("getLiveCurrentTime", callback);
  }
  /** Get the current height 
   * @param {function} callback
  */
  getHeight(callback) {
    this._get("getHeight", callback);
  }
  /** Reload the player
   * @param {object} payload
  */
  reload(payload) {
    this._call("reload", payload);
  }
  /** private api 
   *  Get the current media's duration. 
   * @param {function} callback
  */
  getTracks(callback) {
    this._get("getTracks", callback);
  }
  /** private api 
   * Sets the desired text track to active 
   * Checkes if the track url is aleready added to player - does not create duplicates
   * @param {object} track
  */
  setTrack(track) {
    this._call("setTrack", track);
  }
  /** private api
   * Add a new cue on the currently playing track     
   * @param {object} cue     
  */
  cueAdd(cue) {
    this._call("cueAdd", cue);
  }
  /** private api
   * Update the cue on the currently playing track     
   * @param {object} cue
   * @param {object} field
  */
  cueUpdate(cue, field) {
    this._call("cueUpdate", { cue, field });
  }
  /** private api
   * Delete the cue on the currently playing track     
   * @param {object} cue     
  */
  cueDelete(cue) {
    this._call("cueDelete", cue);
  }
  /** private api
   * Update the cue on the currently playing track     
   * @param {object} cues
   * @param {object} id
  */
  asrAdd(cues, id) {
    this._call("asrAdd", { cues, id });
  }
  /**
   * Add an event listener to the player.
   * @param {string} eventName
   * @param {function} callback
   */
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }
}
function embed(embedKey, targetId, playerSettings = {}, forceAspectRatio = void 0) {
  const { location } = config();
  playerSettings.dynamicSizing = forceAspectRatio == void 0;
  playerSettings.apiEmbed = true;
  playerSettings.documentLocation = location;
  const target = document.getElementById(targetId);
  if (target) {
    target.innerHTML = "";
  }
  const frame = frameWriter(embedKey, targetId, playerSettings, forceAspectRatio);
  const api = new PlayerCommandApi(frame, playerSettings);
  return api;
}
export {
  embed as default
};
