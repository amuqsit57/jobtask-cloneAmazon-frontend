import Link from 'next/link';

const COLUMNS = [
  {
    title: 'Get to Know Us',
    links: ['Careers', 'Blog', 'About Amazon', 'Investor Relations', 'Amazon Devices', 'Amazon Science'],
  },
  {
    title: 'Make Money with Us',
    links: ['Sell products on Amazon', 'Sell on Amazon Business', 'Sell apps on Amazon', 'Become an Affiliate', 'Advertise Your Products'],
  },
  {
    title: 'Amazon Payment Products',
    links: ['Amazon Business Card', 'Shop with Points', 'Reload Your Balance', 'Amazon Currency Converter'],
  },
  {
    title: 'Let Us Help You',
    links: ['Amazon and COVID-19', 'Your Account', 'Your Orders', 'Shipping Rates & Policies', 'Returns & Replacements', 'Help'],
  },
];

export function Footer() {
  return (
    <footer className="mt-10">
      <Link
        href="#top"
        className="block bg-[#37475A] py-4 text-center text-[13px] text-white hover:bg-[#485769]"
      >
        Back to top
      </Link>

      <div className="bg-[var(--color-nav-light)] px-6 py-10 text-white">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-2 text-[16px] font-bold">{col.title}</h3>
              <ul className="space-y-1.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <span className="cursor-pointer text-[13px] text-[#DDD] hover:underline">
                      {l}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[var(--color-nav)] py-6 text-center text-[12px] text-[#DDD]">
        <p className="mb-2 text-[16px] font-bold text-white">amazon</p>
        <p>
          A rebuild for an engineering assignment. Not affiliated with Amazon.com,
          Inc.
        </p>
        <p className="mt-1">
          &copy; {new Date().getFullYear()} Built as a 24-hour clone exercise.
        </p>
      </div>
    </footer>
  );
}
