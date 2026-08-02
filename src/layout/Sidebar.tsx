import React from 'react';
import { NavLink } from 'react-router-dom';
import { TrendingUp, Briefcase, ShoppingCart, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { icon: TrendingUp, label: 'Invest', href: '/' },
  { icon: Briefcase, label: 'Portfolio', href: '/user/dashboard' },
  { icon: ShoppingCart, label: 'Orders', href: '/investor/orders' },
  { icon: ArrowLeftRight, label: 'Buy/Sell', href: '/investor/trade' },
];

 const Sidebar = () => {
  return (
    <div className="w-64 bg-background border-r border-border min-h-screen">
      <div className="p-6">
        <div className="text-xl font-bold text-foreground">YOUR LOGO</div>
      </div>
      
      <nav className="mt-8">
        {navigationItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center px-6 py-3 text-text-secondary hover:bg-surface-light hover:text-foreground transition-colors",
                isActive && "bg-surface text-white hover:bg-surface hover:text-white"
              )
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
export default Sidebar;