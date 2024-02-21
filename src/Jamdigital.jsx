import React, { useState, useEffect } from 'react';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';
function JamDigital() {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timerID = setInterval(
            () => tick(),
            1000
        );

        return function cleanup() {
            clearInterval(timerID);
        };
    });

    function tick() {
        setDate(new Date());
    }

    return (
        <div>
            <div className="jam-digital">
                <Clock
                    value={date}
                    size={150}
                    renderNumbers={true} // Menonaktifkan tanda menit
                />
            </div>
        </div>
    );
}

export default JamDigital;
