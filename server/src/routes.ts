import { Router } from 'express';
import authRouter from './modules/auth/auth.routes';
import propertyRouter from './modules/property/property.routes';
import unitRouter from './modules/unit/unit.routes';
import tenantRouter from './modules/tenant/tenant.routes';
import leaseRouter from './modules/lease/lease.routes';
import rentRouter from './modules/rent/rent.routes';

const router = Router();
router.use('/auth', authRouter);
router.use('/properties', propertyRouter);
// Nested units under a property, plus standalone unit routes. The unit router
// uses mergeParams so :propertyId is available on the nested shape and ignored
// on the standalone shape.
router.use('/properties/:propertyId/units', unitRouter);
router.use('/units', unitRouter);
router.use('/tenants', tenantRouter);
router.use('/leases', leaseRouter);
router.use('/rent', rentRouter);
import dashboardRouter from './modules/dashboard/dashboard.routes';
router.use('/dashboard', dashboardRouter);
export default router;
