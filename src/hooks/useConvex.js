// Usage in components:
//   import { useQuery, useMutation } from 'convex/react';
//   import { api } from '../../convex/_generated/api';
//
//   const patients = useQuery(api.patients.list, {});
//   const createPatient = useMutation(api.patients.create);
export { useQuery, useMutation, useConvex } from 'convex/react';
