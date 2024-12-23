import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE = 'https://localhost:7015/api/Entries';

const Home: React.FC = () => {
    const [entries, setEntries] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [showAddEntryForm, setShowAddEntryForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newText, setNewText] = useState('');
    const [newImages, setNewImages] = useState<File[]>([]);
    const [message, setMessage] = useState('');
    const [images, setImages] = useState<{ [key: string]: string }>({}); // To store first image for each entry
    const [editingEntry, setEditingEntry] = useState<any | null>(null); // State for editing entry

    // Fetch all entries
    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const jwt = Cookies.get('jwt');
                const response = await axios.get(`${API_BASE}/entries`, {
                    headers: { Authorization: `Bearer ${jwt}` },
                });
                setEntries(response.data);

                // Fetch first image for each entry
                response.data.forEach((entry: any) => {
                    fetchImage(entry.id);
                });
            } catch (err: any) {
                setError('Failed to fetch entries.');
            }
        };

        fetchEntries();
    }, []);

    // Fetch the first image for a given entry and modify the image URL
    const fetchImage = async (id: string) => {
        try {
            const response = await axios.get(`${API_BASE}/get-images/${id}`);
            if (response.data && response.data.length > 0) {
                // Modify the image URL to include the full path
                const imageUrl = `https://localhost:7015/${response.data[0].imageUrl.replace('\\', '/')}`;
                setImages((prevImages) => ({
                    ...prevImages,
                    [id]: imageUrl,
                }));
            }
        } catch (err) {
            console.error('Failed to fetch image for entry', id);
        }
    };

    // Handle image upload and conversion to base64
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewImages(Array.from(e.target.files));
        }
    };

    // Handle form submission for adding a new entry
    const handleSubmitNewEntry = async (e: React.FormEvent) => {
        e.preventDefault();
    
        try {
            const jwt = Cookies.get('jwt');
    
            // Convert images to base64 and remove the prefix
            const base64Images = await Promise.all(
                newImages.map(file =>
                    new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const base64String = reader.result as string;
                            const cleanBase64 = base64String.split(',')[1];
                            resolve(cleanBase64);
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    })
                )
            );
    
            // Prepare the payload
            const payload = {
                title: newTitle,
                text: newText,
                images: base64Images,
            };
    
            // Send data to server
            await axios.post(`${API_BASE}/add-entry`, payload, {
                headers: { Authorization: `Bearer ${jwt}` },
            });
    
            setMessage('New entry added successfully!');
            setNewTitle('');
            setNewText('');
            setNewImages([]);
            setShowAddEntryForm(false);
            
            // Refetch entries to show the new one
            const response = await axios.get(`${API_BASE}/entries`, {
                headers: { Authorization: `Bearer ${jwt}` },
            });
            setEntries(response.data);
        } catch (err: any) {
            setMessage('Failed to add entry.');
        }
    };

    // Handle form submission for updating an existing entry
    const handleUpdateEntry = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingEntry) return;

        try {
            const jwt = Cookies.get('jwt');
    
            // Convert images to base64 and remove the prefix if new images are uploaded
            const base64Images = await Promise.all(
                newImages.map(file =>
                    new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const base64String = reader.result as string;
                            const cleanBase64 = base64String.split(',')[1];
                            resolve(cleanBase64);
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    })
                )
            );

            // Prepare the updated payload
            const payload = {
                title: newTitle || editingEntry.title,
                text: newText || editingEntry.text,
                images: base64Images.length > 0 ? base64Images : editingEntry.images,
            };
            console.log(payload);
            // Send data to server with PUT method
            await axios.put(`${API_BASE}/entries/${editingEntry.id}`, payload, {
                headers: { Authorization: `Bearer ${jwt}` },
            });

            setMessage('Entry updated successfully!');
            setNewTitle('');
            setNewText('');
            setNewImages([]);
            setShowAddEntryForm(false);
            setEditingEntry(null);

            // Refetch entries to show the updated one
            const response = await axios.get(`${API_BASE}/entries`, {
                headers: { Authorization: `Bearer ${jwt}` },
            });
            setEntries(response.data);
        } catch (err: any) {
            setMessage('Failed to update entry.');
        }
    };

    return (
        <div className="container mt-5">
            <h1>Diary Entries</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            {message && <div className="alert alert-info">{message}</div>}

            <button
                className="btn btn-primary mb-4"
                onClick={() => setShowAddEntryForm(!showAddEntryForm)}
            >
                {showAddEntryForm ? 'Cancel' : editingEntry ? 'Edit Entry' : 'Add New Entry'}
            </button>

            {showAddEntryForm && (
                <form onSubmit={editingEntry ? handleUpdateEntry : handleSubmitNewEntry}>
                    <div className="mb-3">
                        <label htmlFor="newTitle" className="form-label">Title</label>
                        <input
                            type="text"
                            id="newTitle"
                            className="form-control"
                            value={newTitle || editingEntry?.title || ''}
                            onChange={(e) => setNewTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="newText" className="form-label">Text</label>
                        <textarea
                            id="newText"
                            className="form-control"
                            value={newText || editingEntry?.text || ''}
                            onChange={(e) => setNewText(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="newImages" className="form-label">Upload Images</label>
                        <input
                            type="file"
                            id="newImages"
                            className="form-control"
                            multiple
                            onChange={handleImageUpload}
                        />
                    </div>
                    <button type="submit" className="btn btn-success">
                        {editingEntry ? 'Save Changes' : 'Add Entry'}
                    </button>
                </form>
            )}

            <ul className="list-group mt-4">
                {entries.map(entry => (
                    <li key={entry.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>{entry.title}</span>
                        {images[entry.id] && (
                            <img
                                src={images[entry.id]}
                                alt="Entry Thumbnail"
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                        )}
                        <button
                            className="btn btn-sm btn-warning"
                            onClick={() => {
                                setEditingEntry(entry);
                                setShowAddEntryForm(true);
                                setNewTitle(entry.title);
                                setNewText(entry.text);
                            }}
                        >
                            Edit
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Home;
