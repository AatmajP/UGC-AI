import express from 'express';
import { createProject, createVideo, deleteProject, 
    getAllPublishProject } from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import upload from '../configs/multer.js';

const projectRouter = express.Router()

projectRouter.post('/create',upload.array('images', 2), protect, createProject)
projectRouter.post('/video', protect, createVideo)
projectRouter.get('/published', getAllPublishProject)
projectRouter.delete('/:projectId', protect, deleteProject)

export default projectRouter