// src/utils/auditLogger.js
const AuditLog = require("../models/AuditLog");

async function logCreate(
  docType,
  docId,
  docName,
  restaurantId,
  userId,
  userName,
  importBatchId
) {
  await AuditLog.create({
    docType,
    docId,
    docName,
    restaurantId,
    operation: "create",
    changedBy: userId,
    changedByName: userName,
    importBatchId,
  });
}

async function logDisable(
  docType,
  docId,
  docName,
  restaurantId,
  userId,
  userName,
  importBatchId
) {
  await AuditLog.create({
    docType,
    docId,
    docName,
    restaurantId,
    operation: "disable",
    changedBy: userId,
    changedByName: userName,
    importBatchId,
  });
}

async function logUpdate(
  docType,
  docId,
  docName,
  restaurantId,
  userId,
  userName,
  changesArr,
  importBatchId
) {
  if (!changesArr || changesArr.length === 0) return;
  await AuditLog.create({
    docType,
    docId,
    docName,
    restaurantId,
    operation: "update",
    changedBy: userId,
    changedByName: userName,
    changes: changesArr,
    importBatchId,
  });
}

async function logRename(
  docType,
  docId,
  oldName,
  newName,
  restaurantId,
  userId,
  userName,
  importBatchId
) {
  await AuditLog.create({
    docType,
    docId,
    docName: newName, // docName can hold the new name
    restaurantId,
    operation: "rename",
    changedBy: userId,
    changedByName: userName,
    changes: [
      {
        field: "name",
        oldValue: oldName,
        newValue: newName,
      },
    ],
    importBatchId,
  });
}

module.exports = {
  logCreate,
  logDisable,
  logUpdate,
  logRename,
};
