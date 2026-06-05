/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as appointments from "../appointments.js";
import type * as auth from "../auth.js";
import type * as billing from "../billing.js";
import type * as chemoSessions from "../chemoSessions.js";
import type * as clinical from "../clinical.js";
import type * as http from "../http.js";
import type * as inpatient from "../inpatient.js";
import type * as lis from "../lis.js";
import type * as nursing from "../nursing.js";
import type * as patients from "../patients.js";
import type * as pharmacy from "../pharmacy.js";
import type * as quality from "../quality.js";
import type * as radiology from "../radiology.js";
import type * as revenue from "../revenue.js";
import type * as statsHelper from "../statsHelper.js";
import type * as tumorBoard from "../tumorBoard.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  appointments: typeof appointments;
  auth: typeof auth;
  billing: typeof billing;
  chemoSessions: typeof chemoSessions;
  clinical: typeof clinical;
  http: typeof http;
  inpatient: typeof inpatient;
  lis: typeof lis;
  nursing: typeof nursing;
  patients: typeof patients;
  pharmacy: typeof pharmacy;
  quality: typeof quality;
  radiology: typeof radiology;
  revenue: typeof revenue;
  statsHelper: typeof statsHelper;
  tumorBoard: typeof tumorBoard;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
