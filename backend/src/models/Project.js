import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  userEmail: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'active'
  },
  steps: {
    model: { type: String, default: 'pending' },
    texture: { type: String, default: 'pending' },
    garment: { type: String, default: 'pending' }
  },
  files: {
    model: { type: String, default: null },
    shirt: { type: String, default: null },
    garment: { type: String, default: null }
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
