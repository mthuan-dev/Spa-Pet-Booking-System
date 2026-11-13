import { Layout } from 'antd';

const { Footer: FooterAnt } = Layout;

const FooterAdmin = () => {
  return (
    <FooterAnt className="text-center">
      Copyright © {new Date().getFullYear()} Ticket Booking
    </FooterAnt>
  );
};

export default FooterAdmin;
