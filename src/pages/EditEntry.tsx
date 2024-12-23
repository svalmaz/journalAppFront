import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useHistory } from 'react-router-dom';

interface ImageData {
    imageUrl: string;
    imageId: string;
}

const EditEntry: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const history = useHistory();
    const [entry, setEntry] = useState<any>({});
    const [newTitle, setNewTitle] = useState('');
    const [newText, setNewText] = useState('');
    const [newImages, setNewImages] = useState<File[]>([]);
    const [images, setImages] = useState<ImageData[]>([]);

    // Fetch entry details by ID
    useEffect(() => {
        const fetchEntry = async () => {
            try {
                const response = await axios.get(`http://svalmazchecks1-001-site1.ntempurl.com/api/Entries/entries/${id}`);
                setEntry(response.data);
                setNewTitle(response.data.title);
                setNewText(response.data.text);
                setImages(response.data.images || []);
            } catch (err) {
                console.error('Failed to fetch entry data', err);
            }
        };

        fetchEntry();
    }, [id]);

    // Handle image upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewImages(Array.from(e.target.files));
        }
    };

    // Handle image removal
    const handleRemoveImage = async (imageId: string) => {
        try {
            await axios.delete(`http://svalmazchecks1-001-site1.ntempurl.com/api/Entries/entries/${id}/images/${imageId}`);
            setImages(images.filter(image => image.imageId !== imageId));
        } catch (err) {
            console.error('Failed to delete image', err);
        }
    };

    // Handle entry update
    const handleSubmitEditEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', newTitle);
            formData.append('text', newText);
            
            // Add images to formData if any
            for (let i = 0; i < newImages.length; i++) {
                formData.append('images', newImages[i]);
            }

            // PUT request to update the entry
            await axios.put(`http://svalmazchecks1-001-site1.ntempurl.com/api/Entries/entries/${id}`, formData);
            history.push('/'); // Navigate to the main page or wherever you want after update
        } catch (err) {
            console.error('Failed to update entry', err);
        }
    };

    return (
        <div className="container mt-5">
            <h1>Edit Entry</h1>
            <form onSubmit={handleSubmitEditEntry}>
                <div className="mb-3">
                    <label htmlFor="newTitle" className="form-label">Title</label>
                    <input
                        type="text"
                        id="newTitle"
                        className="form-control"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="newText" className="form-label">Text</label>
                    <textarea
                        id="newText"
                        className="form-control"
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="newImages" className="form-label">Upload New Images</label>
                    <input
                        type="file"
                        id="newImages"
                        className="form-control"
                        multiple
                        onChange={handleImageUpload}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Existing Images</label>
                    <div className="d-flex">
                        {images.map((image) => (
                            <div key={image.imageId} className="me-3 position-relative">
                                <img
                                    src={`https://localhost:7015/images/${image.imageUrl}`}
                                    alt="Entry Image"
                                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-danger position-absolute top-0 end-0"
                                    style={{ fontSize: '14px' }}
                                    onClick={() => handleRemoveImage(image.imageId)}
                                >
                                    X
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" className="btn btn-success">Update Entry</button>
            </form>
        </div>
    );
};

export default EditEntry;
