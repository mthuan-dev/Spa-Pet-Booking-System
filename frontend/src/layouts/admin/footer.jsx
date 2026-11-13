import { Layout } from 'antd';

const { Footer: FooterAnt } = Layout;

const FooterAdmin = () => {
  return (
    <FooterAnt className="text-center">
      Copyright © {new Date().getFullYear()} PetSpa Booking
    </FooterAnt>
  );
};

export default FooterAdmin;
