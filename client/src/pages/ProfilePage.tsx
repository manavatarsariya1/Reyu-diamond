import Profile from '@/components/Profile';
import React from 'react';

export default function ProfilePage() {
    return (
        <div className='p-6'>
            <h2 className='text-2xl font-bold mb-4'>Profile</h2>
            <div className='bg-white dark:bg-slate-800  rounded-lg shadow'>
                <Profile/>
                {/* <p>Profile Settings Content</p> */}
            </div>
        </div>
    );
}
