//main layout for the investor dashboard

import { User, PieChart, BarChart3, FileText, Shield, PieChartIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const Sidebar = () => {

  const navigate = useNavigate();
  const pathname = useLocation(); 

  const isActive = (path: string) => pathname.pathname === path;

	return (
		<aside className="w-64 min-h-screen border-r border-primary/20 bg-surface-light/50 p-6 hidden lg:block">
        <nav className="space-y-2">
            <Link to="/user/dashboard">
              <Button
                variant="ghost"
              className={`w-full justify-start ${isActive('/user/dashboard') ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/90 text-black font-medium active:text-primary-foreground'}`}
              >
              <PieChartIcon className="mr-2 h-4 w-4" />
                Portfolio
              </Button>
            </Link>
          <Link to="/user/documents">
              <Button
                variant="ghost"
              className={`w-full justify-start text-foreground ${isActive('/user/documents') ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/90 hover:text-black active:text-primary-foreground'}`}
              >
              <FileText className="mr-2 h-4 w-4" />
              Documents
              </Button>
            </Link>
            <Link to="/investor/compliance">
              <Button
                variant="ghost"
              className={`w-full justify-start text-foreground ${isActive('/investor/compliance') ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/90 hover:text-black active:text-primary-foreground'}`}
              >
                <Shield className="mr-2 h-4 w-4" />
                Compliance
              </Button>
            </Link>
          <Link to="/user/profile">
              <Button
                variant="ghost"
              className={`w-full justify-start text-foreground ${isActive('/user/profile') ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/90 hover:text-black active:text-primary-foreground'}`}
              >
              <User className="mr-2 h-4 w-4" />
              Profile
              </Button>
            </Link>
           
          </nav>
        </aside>
	)
} 

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  // Dashboard routes where AdvancedInvestorPortfolio handles its own layout
  const dashboardRoutes = ['/user/dashboard', '/user/documents', '/investor/compliance', '/user/profile'];
  
  // If on dashboard routes, don't render the sidebar wrapper
  if (dashboardRoutes.includes(location.pathname)) {
    return <>{children}</>;
  }

	return (
		<div className="flex min-h-screen w-full space-y-6 bg-gradient-to-br from-slate-50 to-slate-100">
			<div className="">
				<Sidebar />
			</div>
			<div className="w-full">{children}</div>
		</div>
	);
};