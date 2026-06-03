import ThemeRedirect from './ThemeRedirect';

const VALID = ['1', '2', '3', '4', '5', '6', '7', '8'];

export function generateStaticParams() {
  return VALID.map(themeId => ({ themeId }));
}

export default function ThemeSetPage() {
  return <ThemeRedirect />;
}
