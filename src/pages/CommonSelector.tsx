import React, { useEffect, useState } from 'react';
import axios from 'axios';

function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('/api/users');
                if (response.data.code === 200) {
                    setUsers(response.data.data.list);
                }
            } catch (error) {
                console.error('获取用户列表失败:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) return <div>加载中...</div>;

    return (
        <div>
            <h2>用户列表</h2>
            <ul>
                {users.map(user => (
                    <li key={user.id}>
                        {user.name} - {user.age}岁 - {user.gender}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UserList;