"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button, Card, ModalShell, PageActions, PageHeader, PageTitle } from "@/components/ui";
import Cropper from "react-easy-crop";
import type { Point, Area } from "react-easy-crop";
import { ImagePlus, Plus, X } from "lucide-react";
import styles from "./TroopPage.module.css";


// Canvas Helper for Cropping
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error('Canvas is empty'));
            }
        }, 'image/jpeg');
    });
}

const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

const TroopLogo = ({ src, alt = "Logo" }: { src?: string; alt?: string }) => (
    <div style={{
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        border: "2px solid #000",
        backgroundColor: "#ccc", // Placeholder gray
        boxShadow: "4px 4px 0 0 #000", // The shadow (static)
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    }}>
        {src ? (
            <img
                src={src}
                alt={alt}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",

                }}
            />
        ) : (
            <div style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#e4e4e7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "0.8rem",
                color: "#71717a",

            }}>
                Logo
            </div>
        )}
    </div>
);

// Main Page Component
export default function TroopsPage() {
    const searchParams = useSearchParams();
    const troops = useQuery(api.troops.getByUser);
    const createTroop = useMutation(api.troops.create);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);

    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        if (searchParams.get("create") === "true") setShowCreateForm(true);
    }, [searchParams]);

    // Form State
    const [newName, setNewName] = useState("");
    const [newNumber, setNewNumber] = useState("");
    const [newType, setNewType] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // Image Upload State
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [croppedImageBlob, setCroppedImageBlob] = useState<Blob | null>(null); // To store ready-to-upload blob
    const [previewUrl, setPreviewUrl] = useState<string | null>(null); // For local preview

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageDataUrl = await readFile(file);
            setImageSrc(imageDataUrl);
            setCroppedImageBlob(null); // Reset until cropped
            setPreviewUrl(null);
        }
    };

    const confirmCrop = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        try {
            const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
            setCroppedImageBlob(blob);
            setPreviewUrl(URL.createObjectURL(blob));
            setImageSrc(null); // Close cropper
        } catch (e) {
            console.error(e);
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            let logoStorageId = undefined;

            // 1. Upload Image if exists
            if (croppedImageBlob) {
                // Get URL
                const postUrl = await generateUploadUrl();
                // Post Blob
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": croppedImageBlob.type },
                    body: croppedImageBlob,
                });
                const { storageId } = await result.json();
                logoStorageId = storageId;
            }

            await createTroop({
                name: newName,
                number: newNumber,
                type: newType,
                logo: logoStorageId,
            });
            // Reset and close
            setNewName("");
            setNewNumber("");
            setNewType("");
            setCroppedImageBlob(null);
            setPreviewUrl(null);
            setImageSrc(null);
            setShowCreateForm(false);
        } catch (error: unknown) {
            alert("Error creating troop: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div style={{ position: "relative", minHeight: "80vh", paddingBottom: "2rem" }}>
            {/* Standard Header */}
            <PageHeader>
                <PageTitle>Oddíly</PageTitle>
                <PageActions><Button onClick={() => setShowCreateForm(true)}><Plus size={20} /> Přidat oddíl</Button></PageActions>
                    {showCreateForm && (
<ModalShell className={styles.createDialog} width="610px" onClose={isCreating ? undefined : () => setShowCreateForm(false)} aria-labelledby="new-troop-title">
                            <div className={styles.dialogHeader}>
                              <div><span>Nový oddíl</span><h2 id="new-troop-title">Vytvořit oddíl</h2><p>Základní údaje můžete kdykoliv doplnit v nastavení.</p></div>
                              <button disabled={isCreating} onClick={() => setShowCreateForm(false)} aria-label="Zavřít"><X size={22} /></button>
                            </div>
                            <form onSubmit={handleCreate} className={styles.createForm}>
                                <div className={styles.logoRow}>
                                    <div className={styles.logoPreview}>
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Náhled loga" />
                                        ) : (
                                            <ImagePlus size={25} />
                                        )}
                                    </div>
                                    <div><strong>Logo oddílu</strong><small>Čtvercový obrázek, ideálně alespoň 400 × 400 px.</small>
                                        <label className={styles.uploadButton}>Vybrat obrázek
                                            <input aria-label="Logo oddílu" className={styles.fileInput} type="file" accept="image/*" onChange={handleFileChange} disabled={isCreating} />
                                        </label>
                                    </div>
                                </div>
                                <div className={styles.formField}>
                                    <label htmlFor="troop-name">Jméno oddílu</label>
                                    <input
                                        id="troop-name"
                                        required
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        placeholder="Chodci"
                                    />
                                </div>
                                <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label htmlFor="troop-number">Číslo oddílu</label>
                                        <input
                                            id="troop-number"
                                            value={newNumber}
                                            onChange={e => setNewNumber(e.target.value)}
                                            placeholder="106"
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label htmlFor="troop-type">Typ</label>
                                        <input
                                            id="troop-type"
                                            value={newType}
                                            onChange={e => setNewType(e.target.value)}
                                            placeholder="Skauti"
                                        />
                                    </div>
                                </div>
                                <div className={styles.dialogActions}><button type="button" disabled={isCreating} onClick={() => setShowCreateForm(false)}>Zrušit</button><button type="submit" disabled={isCreating}>{isCreating ? "Vytvářím…" : "Vytvořit oddíl"}</button></div>
                            </form>
                        </ModalShell>
                    )}
            </PageHeader>

            <div className="dashboardContent">

            {/* Troops Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
                gap: "1.25rem"
            }}>
                {troops === undefined ? (
                    <div>Načítám oddíly...</div>
                ) : troops.length === 0 ? (
                    <div style={{ opacity: 0.6, fontStyle: "italic", padding: "1rem" }}>
                        Zatím nemáte žádné oddíly. Klikněte na + vpravo nahoře.
                    </div>
                ) : (
                    troops.map((troop) => (
                        <Link className={styles.troopLink} href={`/troop/${troop._id}`} key={troop._id}>
                            <Card interactive className={styles.troopCard}>
                                <div className={styles.cardTop}><span>{troop.number ? `${troop.number}. oddíl` : "Skautský oddíl"}</span><TroopLogo src={troop.logo} /></div>
                                <h2>{troop.name}</h2>
                                {troop.type && <p>{troop.type}</p>}
                            </Card>
                        </Link>
                    ))
                )}
            </div>

            {/* Cropper Modal Overlay */}
            {imageSrc && (
                <ModalShell aria-label="Oříznout logo oddílu" width="680px" onClose={() => setImageSrc(null)}>
                    <div style={{ position: "relative", width: "100%", height: "min(55dvh, 400px)", backgroundColor: "#333", borderRadius: "8px", overflow: "hidden" }}>
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                        />
                    </div>
                    <div style={{ padding: "1rem", display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "flex-end" }}>
                        <Button variant="secondary" onClick={() => setImageSrc(null)}>Zrušit</Button>
                        <Button onClick={confirmCrop}>Oříznout a použít</Button>
                    </div>
                </ModalShell>
            )}
            </div>
        </div>
    );
}

function readFile(file: File): Promise<string> {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.addEventListener('load', () => resolve(reader.result as string), false)
        reader.readAsDataURL(file)
    })
}
