import { useTranslation } from 'react-i18next';

/** Premium orbit-spinner — 3 gold dots in orbit. */
export default function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const { t } = useTranslation();
  const px = size === 'sm' ? 36 : size === 'lg' ? 96 : 72;
  return (
    <div className="orbit-spinner" style={{ width: px, height: px }} aria-label={t('common.loading')} role="status">
      <span className="orbit-dot" />
      <span className="orbit-dot" />
      <span className="orbit-dot" />
    </div>
  );
}
