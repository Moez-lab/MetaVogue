import { useState, useEffect } from 'react';
import { useGlobal } from '../../context/GlobalContext';
import { Icon } from '../../components/Icon';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const WorkTrackingView = () => {
    const { allProjects, deleteProject, resumeProject, editProject, users, orders, user } = useGlobal();
    const admins = users.filter(u => u.isAdmin);
    // Use local state only for the form, not the list
    const [projects, setProjects] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        setProjects(allProjects);
    }, [allProjects]);

    const [formData, setFormData] = useState({
        id: '',
        company: '',
        shirtDesc: '',
        modelDesc: '',
    });

    const [files, setFiles] = useState({
        shirtFile: null,
        modelFile: null
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterCompany, setFilterCompany] = useState('');

    // Derive unique companies for the dropdown
    const companies = [...new Set(projects.filter(p => p.company).map(p => p.company))].sort();

    // Generate ID on mount if empty
    useEffect(() => {
        if (!formData.id) {
            generateNewId();
        }
    }, []);

    const generateNewId = () => {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        setFormData(prev => ({ ...prev, id: `PRJ-${timestamp}-${random}` }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files: fileList } = e.target;
        if (fileList[0]) {
            setFiles(prev => ({ ...prev, [name]: fileList[0] }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingId) {
            // Edit Mode
            editProject(editingId, {
                company: formData.company,
                shirtDesc: formData.shirtDesc,
                modelDesc: formData.modelDesc
            });
            setEditingId(null);
        } else {
            // Create Mode (Legacy/Manual)
            // Concatenate ID with descriptions
            const finalShirtDesc = `${formData.id} ${formData.shirtDesc}`;
            const finalModelDesc = formData.modelDesc ? `${formData.id} ${formData.modelDesc}` : '';

            const newProject = {
                ...formData,
                shirtDesc: finalShirtDesc,
                modelDesc: finalModelDesc,
                date: new Date().toISOString(),
                files: {
                    shirt: files.shirtFile ? files.shirtFile.name : null,
                    model: files.modelFile ? files.modelFile.name : null
                },
                steps: { model: 'done', texture: 'done', garment: 'done' } // Assume manual entry is done
            };

            // We should use createProject from global context really, but for now we just push to list
            // This manual form is becoming a bit redundant with the new workflow, but we keep it for "Edit" purposes
        }

        // Reset form
        setFormData({
            id: '',
            company: '',
            shirtDesc: '',
            modelDesc: '',
        });
        setFiles({ shirtFile: null, modelFile: null });
        generateNewId();
    };

    const handleEditClick = (project) => {
        setEditingId(project.id);
        setFormData({
            id: project.id,
            company: project.company,
            shirtDesc: project.shirtDesc || '',
            modelDesc: project.modelDesc || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({
            id: '',
            company: '',
            shirtDesc: '',
            modelDesc: '',
        });
        generateNewId();
    };

    const handleDownload = async (project) => {
        const zip = new JSZip();
        const folder = zip.folder(project.id);

        // Add text data
        const infoContent = `
Project ID: ${project.id}
Company: ${project.company}
Date: ${(() => { try { return project.date ? new Date(project.date).toLocaleString() : 'Unknown'; } catch (e) { return 'Invalid'; } })()}

--- Shirt Description ---
${project.shirtDesc}

--- Model Description ---
${project.modelDesc}
        `;
        folder.file("info.txt", infoContent);

        // In a real scenario with backend, we would fetch the files here.
        // Since we only have the current session's file objects for the *active* form,
        // we can't easily download old files from localStorage unless we stored them as Base64 (which has size limits).
        // For this demo, we'll add a placeholder note if files were "uploaded".

        if (project.files?.shirt) {
            folder.file(`shirt_placeholder_${project.files.shirt}.txt`, "File was uploaded in session.");
        }
        if (project.files?.model) {
            folder.file(`model_placeholder_${project.files.model}.txt`, "File was uploaded in session.");
        }

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `${project.id}.zip`);
    };

    // Merge Projects and Assigned Orders for the History View
    const workItems = [
        ...projects.map(p => ({ ...p, type: 'project' })),
        // Only show orders that are explicitly assigned to THIS admin
        ...orders.filter(o => o.assignedAdminEmail === user?.email).map(o => ({ 
            ...o, 
            type: 'order',
            company: o.brandName 
        }))
    ];

    const filteredItems = workItems.filter(p => {
        const matchesSearch = (p.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.company || '').toLowerCase().includes(searchTerm.toLowerCase());

        // Date/Time Filter Logic
        let matchesDate = true;
        if (filterDate) {
            const projectDate = new Date(p.date);
            const filterDateTime = new Date(filterDate);

            // Comparing down to minutes
            matchesDate =
                projectDate.getFullYear() === filterDateTime.getFullYear() &&
                projectDate.getMonth() === filterDateTime.getMonth() &&
                projectDate.getDate() === filterDateTime.getDate() &&
                projectDate.getHours() === filterDateTime.getHours() &&
                projectDate.getMinutes() === filterDateTime.getMinutes();
        }

        const matchesCompany = filterCompany ? p.company === filterCompany : true;

        return matchesSearch && matchesDate && matchesCompany;
    });

    return (
        <div className="h-full flex flex-col lg:flex-row gap-6 p-6">
            {/* Left Panel: Data Entry */}
            <div className="flex-1 flex flex-col gap-6">
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-cyan-500/10 rounded-2xl">
                            <Icon name="Clipboard" className="text-cyan-500" size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white">{editingId ? 'Edit Project' : 'New Project'}</h2>
                            <p className="text-slate-500 dark:text-slate-400">{editingId ? `Editing ${editingId}` : 'Enter shirt and model details'}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Project ID</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="id"
                                        value={formData.id}
                                        readOnly
                                        className="w-full bg-slate-100 dark:bg-black/40 border-0 rounded-xl p-4 text-slate-500 font-mono text-sm focus:ring-2 focus:ring-cyan-500 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={generateNewId}
                                        className="absolute right-2 top-2 p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <Icon name="Sparkles" size={16} className="text-cyan-500" />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Company Name</label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. MetaVogue Corp"
                                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Shirt Section */}
                        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                                <Icon name="Shirt" size={20} />
                                <h3 className="font-bold">Shirt Details</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <textarea
                                    name="shirtDesc"
                                    value={formData.shirtDesc}
                                    onChange={handleInputChange}
                                    placeholder="Describe the shirt (color, fabric, style...)"
                                    className="w-full h-24 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all resize-none"
                                />
                                <div className="relative group">
                                    <input
                                        type="file"
                                        name="shirtFile"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="shirt-file"
                                    />
                                    <label htmlFor="shirt-file" className="flex items-center justify-center gap-3 w-full p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-cyan-500 dark:hover:border-cyan-500 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10 transition-all group-hover:text-cyan-600">
                                        <Icon name="UploadCloud" size={20} className="text-slate-400 group-hover:text-cyan-500" />
                                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                                            {files.shirtFile ? files.shirtFile.name : "Upload Shirt Model/Image"}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Model Section */}
                        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                                <Icon name="User" size={20} />
                                <h3 className="font-bold">Model Details</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <textarea
                                    name="modelDesc"
                                    value={formData.modelDesc}
                                    onChange={handleInputChange}
                                    placeholder="Describe the model (pose, dimensions, features...)"
                                    className="w-full h-24 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                                />
                                <div className="relative group">
                                    <input
                                        type="file"
                                        name="modelFile"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="model-file"
                                    />
                                    <label htmlFor="model-file" className="flex items-center justify-center gap-3 w-full p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all group-hover:text-purple-600">
                                        <Icon name="UploadCloud" size={20} className="text-slate-400 group-hover:text-purple-500" />
                                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                                            {files.modelFile ? files.modelFile.name : "Upload Model File/Image"}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <Icon name="CheckCircle" size={20} />
                            {editingId ? 'Update Project' : 'Save Project'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="w-full py-3 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-white font-bold rounded-xl transition-all"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </form>
                </div>
            </div>

            {/* Right Panel: History */}
            <div className="w-full lg:w-96 flex flex-col gap-6">
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl flex-1 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">History</h3>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-500">
                            {workItems.length} Items
                        </span>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex flex-col gap-2 mb-6">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search ID or Company..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                            />
                            <div className="absolute left-3 top-3 text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={filterCompany}
                                onChange={(e) => setFilterCompany(e.target.value)}
                                className="flex-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all appearance-none"
                            >
                                <option value="">All Companies</option>
                                {companies.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <input
                                type="datetime-local"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="flex-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                        {filteredItems.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">
                                <p>No work items found</p>
                            </div>
                        ) : (
                            filteredItems.map((project) => (
                                <div key={project.id} className="group p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-cyan-500/30 transition-all hover:shadow-lg hover:shadow-cyan-500/5 relative overflow-hidden">
                                     {project.type === 'order' && (
                                         <div className="absolute top-0 right-0 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded-bl-lg">
                                             ORDER
                                         </div>
                                     )}
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">{project.company}</h4>
                                            <p className="text-xs font-mono text-cyan-600 dark:text-cyan-400">{project.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 mb-2">
                                        {project.type === 'project' && (
                                            <>
                                                <button
                                                    onClick={() => resumeProject(project)}
                                                    className="p-2 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500 hover:text-white rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
                                                    title="Resume Project"
                                                >
                                                    <Icon name="Play" size={12} /> Resume
                                                </button>
                                                <button
                                                    onClick={() => handleEditClick(project)}
                                                    className="p-2 bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20 rounded-lg transition-colors"
                                                    title="Edit Details"
                                                >
                                                    <Icon name="Edit" size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(project)}
                                                    className="p-2 bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20 rounded-lg transition-colors"
                                                    title="Download Files"
                                                >
                                                    <Icon name="Download" size={14} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this project?')) {
                                                            deleteProject(project.id);
                                                        }
                                                    }}
                                                    className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                                                    title="Delete Project"
                                                >
                                                    <Icon name="Trash" size={14} />
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Assignment UI */}
                                    {project.type === 'project' && (
                                        <div className="mb-4 bg-white/5 p-3 rounded-xl border border-white/5">
                                            <label className="text-[10px] font-bold text-white/40 uppercase mb-2 block">Assigned To</label>
                                            <select
                                                value={project.assignedAdminEmail || ''}
                                                onChange={(e) => editProject(project.id, { assignedAdminEmail: e.target.value || null })}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-xs text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                                            >
                                                <option value="">Unassigned</option>
                                                {admins.map(admin => (
                                                    <option key={admin.email} value={admin.email}>
                                                        {admin.name} ({admin.email})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <div className="flex gap-2 text-[10px] text-slate-500 dark:text-slate-400 mb-2">
                                        <span className="flex items-center gap-1 bg-white dark:bg-black/20 px-2 py-1 rounded-md">
                                            <Icon name="Shirt" size={10} /> {project.files?.shirt ? 'File' : 'No File'}
                                        </span>
                                        <span className="flex items-center gap-1 bg-white dark:bg-black/20 px-2 py-1 rounded-md">
                                            <Icon name="User" size={10} /> {project.files?.model ? 'File' : 'No File'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 text-right">
                                        {(() => {
                                            try {
                                                return project.date ? new Date(project.date).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown Date';
                                            } catch (e) {
                                                return 'Invalid Date';
                                            }
                                        })()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};
