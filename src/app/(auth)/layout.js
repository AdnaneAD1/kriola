import Link from 'next/link'
import AuthCard from '@/app/(auth)/AuthCard'

export const metadata = {
    title: 'KriolaCare',
}

const Layout = ({ children }) => {
    return (
        <div>
            <div className="text-gray-900 antialiased">
                {children}
            </div>
        </div>  
    )
}

export default Layout
