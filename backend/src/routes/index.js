import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { productsRouter } from "../modules/products/products.routes.js";
import { categoriesRouter } from "../modules/categories/categories.routes.js";
import { imagesRouter } from "../modules/images/images.routes.js";
import { carouselRouter } from "../modules/carousel/carousel.routes.js";

export var apiRouter = Router();

apiRouter.use("/Card", authRouter);
apiRouter.use("/MicroSaas/products", productsRouter);
apiRouter.use("/MicroSaas/categories", categoriesRouter);
apiRouter.use("/MicroSaas/carousel", carouselRouter);
apiRouter.use("/Data", imagesRouter);
