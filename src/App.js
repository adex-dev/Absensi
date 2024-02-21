import './App.css';
import { useEffect, useState, useRef, useCallback } from "react";
import { getDistance } from "geolib";
import Webcam from 'react-webcam';
import JamDigital from "./Jamdigital";

function App() {
    const [jarak, setJarak] = useState(null);
    const [imageSrc, setImageSrc] = useState(""); // State untuk menyimpan gambar dari webcam
    const lat2 = -6.211471552022602;
    const lon2 = 106.83405815753208;
    const watchIdRef = useRef(null);
    const webcamRef = useRef(null);
    const [isFakeGPS, setIsFakeGPS] = useState(false);
    const [isCameraAllowed, setIsCameraAllowed] = useState(true);

    const videoConstraints = {
        facingMode: "user",
        height:400,
        width:400,
        screenshotQuality: 1

    };
    // eslint-disable-next-line

    const getLokasi = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat1 = position.coords.latitude;
                const lon1 = position.coords.longitude;
                const jr = getDistance(
                    { latitude: lat1, longitude: lon1 },
                    { latitude: lat2, longitude: lon2 }
                );
                setJarak(jr);
                if (jr <= 200) {
                    clearInterval(watchIdRef.current);
                }
            },
            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        alert("Mohon Izinkan akses location hp anda");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert("Informasi Lokasi tidak tersedia.");
                        break;
                    case error.TIMEOUT:
                        alert("Waktu Permintaan Akses location telah habis");
                        break;
                    default:
                        alert("Terjadi kesalahan yang tidak diketahui");
                        break;
                }
            }
        );
    };

    const capture = useCallback(
        () => {
            const imageSrc = webcamRef.current.getScreenshot();

            const image = new Image();
            image.src = imageSrc;
            image.onload = function() {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = image.width;
                canvas.height = image.height;
                context.drawImage(image, 0, 0);

                // Simpan gambar dengan kualitas yang ditentukan (misalnya 0.9)
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                setImageSrc(imageSrc);

            }
        },
        [webcamRef]
    );
    const handleUserMediaError = () => {
        setIsCameraAllowed(false);
    };
    useEffect(() => {
        getLokasi();
        watchIdRef.current = setInterval(getLokasi, 5000);
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                clearInterval(watchIdRef.current);
                setIsCameraAllowed(false)
            } else {
                getLokasi();
                setIsCameraAllowed(true)
                watchIdRef.current = setInterval(getLokasi, 5000);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            clearInterval(watchIdRef.current);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };

    }, [lat2, lon2]);
    useEffect(() => {
        if (jarak !== null && jarak <= 200) {
            setIsFakeGPS(true);
        } else {
            setIsFakeGPS(false);
        }
    }, [jarak]);

    return (
        <div className="App">
            <span>Jarak antara dua titik: {jarak} Meter</span><br/>
            <JamDigital/>
            {isFakeGPS && <p style={{color: 'red'}}>Deteksi GPS palsu!</p>}\
            <div className="jam-digital">
                {isCameraAllowed ? (
                    <Webcam
                        audio={false}
                        height={200}
                        style={{borderRadius: '50%'}}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        width={200} videoConstraints={videoConstraints}
                        onUserMediaError={handleUserMediaError}
                    />
                ) : (
                    <p>Kamera tidak diizinkan atau tidak tersedia.</p>
                )}
            </div>
            <br/>
            <br/>
            <button onClick={capture}>Ambil Gambar</button>
            <br/>
            <button onClick={() => setImageSrc(null)}>Reset</button>
            <br/>
            {imageSrc && <img src={imageSrc} alt="Webcam"/>}
        </div>
    );
}

export default App;
