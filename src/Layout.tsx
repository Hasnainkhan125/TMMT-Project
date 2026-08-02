import Plasma from "./pages/Home/Plasma";

const Layout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20">
          <div className="fixed inset-0 z-0 bg-black">
          <Plasma
            color="#8b5cf6"
            speed={0.8}
            direction="forward"
            scale={1.5}
            opacity={0.4}
            mouseInteractive={true}
          />
        </div>
        <div className="relative z-10">{children}</div>
      
      
    </div>
  )
}

export default Layout;