import React, { useState } from "react";
import AdminAuth from "./AdminAuth";
import AdminDashboard from "./AdminDashboard";

export default function AdminPage() {
    const [authenticated, setAuthenticated] = useState(
        () => !!sessionStorage.getItem("adminCode")
    );

    if (!authenticated) {
        return <AdminAuth onSuccess={() => setAuthenticated(true)} />;
    }

    return <AdminDashboard onLogout={() => setAuthenticated(false)} />;
}
