import { useEffect } from "react";
import { useState } from "react";

function MainPage() {
    const [serverMessage, setServerMessage] = useState("");

    useEffect(() => {
        fetch("http://localhost:3001/")
            .then((response) => response.text())
            .then((data) => setServerMessage(data))
            .catch((error) => console.error("Error fetching:", error));
    }, []);

    return (
        <div>
            <h1>Welcome to JaMoveo</h1>
            <p>{serverMessage}</p>
        </div>
    );
}
export default MainPage;