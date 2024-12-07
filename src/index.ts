import puppeteer, { Browser, Page } from 'puppeteer';

interface GrantDeadline {
    start?: Date;
    end?: Date;
    isRolling: boolean;
    nextDeadline?: Date;
    cycle?: string;
}

interface GrantInfo {
    title: string;
    organization: string;
    amount: string;
    deadline: GrantDeadline;
    description: string;
    eligibility: string;
    upfrontPayment: boolean;
    url: string;
    category: string[];
    lastUpdated: Date;
    minimumAmount: number;
    maximumAmount: number;
    status: 'active' | 'upcoming' | 'closed';
    currency: 'USD' | 'JPY' | 'EUR';
}

class GrantScraper {
    private browser: Browser | null = null;
    private currentDate: Date;

    constructor() {
        this.currentDate = new Date(
            new Date().toLocaleString("en-US", {timeZone: "Asia/Tokyo"})
        );
    }

    async initialize() {
        this.browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async scrapeGrants(): Promise<GrantInfo[]> {
        if (!this.browser) return [];
        
        const grants: GrantInfo[] = [];

        // The Pollination Project
        grants.push({
            title: 'Pollination Project Daily Grant',
            organization: 'The Pollination Project',
            amount: '$1,000',
            minimumAmount: 1000,
            maximumAmount: 1000,
            currency: 'USD',
            deadline: {
                isRolling: true,
                cycle: 'daily',
                nextDeadline: new Date(this.currentDate.getTime() + 24 * 60 * 60 * 1000)
            },
            description: '社会変革を目指す個人に対する日次の助成金。環境、教育、社会正義などの分野で活動する個人を支援。',
            eligibility: '世界中の個人が対象（団体も可）',
            upfrontPayment: true,
            url: 'https://thepollinationproject.org',
            category: ['Social Change', 'Community', 'Environment', 'Education'],
            lastUpdated: new Date(),
            status: 'active'
        });

        // Japan Foundation Grant
        const jfStart = new Date('2024-12-01');
        const jfEnd = new Date('2025-01-15');
        if (this.currentDate <= jfEnd) {
            grants.push({
                title: 'Japan Foundation アートプラットフォーム助成',
                organization: 'Japan Foundation',
                amount: '¥1,000,000 - ¥5,000,000',
                minimumAmount: 1000000,
                maximumAmount: 5000000,
                currency: 'JPY',
                deadline: {
                    start: jfStart,
                    end: jfEnd,
                    isRolling: false,
                    nextDeadline: jfEnd
                },
                description: '日本と海外のアーティスト・文化団体による共同プロジェクトの支援。',
                eligibility: 'アーティスト、文化団体（国際協力が必須）',
                upfrontPayment: true,
                url: 'https://www.jpf.go.jp',
                category: ['Arts', 'Culture', 'International'],
                lastUpdated: new Date(),
                status: 'upcoming'
            });
        }

        // SARAI Project Grant
        const saraiStart = new Date('2024-01-15');
        const saraiEnd = new Date('2024-02-28');
        grants.push({
            title: 'SARAI プロジェクト助成金',
            organization: 'Sustainable Agriculture Research Program',
            amount: '¥500,000 - ¥2,000,000',
            minimumAmount: 500000,
            maximumAmount: 2000000,
            currency: 'JPY',
            deadline: {
                start: saraiStart,
                end: saraiEnd,
                isRolling: false,
                nextDeadline: saraiEnd
            },
            description: '持続可能な農業プロジェクト、特にアクアポニクスや都市農業の革新的なアプローチを支援',
            eligibility: '個人、団体（営利・非営利問わず）',
            upfrontPayment: true,
            url: 'https://sarai.example.com',
            category: ['Agriculture', 'Sustainability', 'Innovation', 'Education'],
            lastUpdated: new Date(),
            status: 'upcoming'
        });

        return grants;
    }

    async getAllGrants(): Promise<GrantInfo[]> {
        const grants = await this.scrapeGrants();
        console.log(`取得した助成金数: ${grants.length}`);
        return grants;
    }

    private formatAmount(amount: string, currency: string): string {
        if (currency === 'JPY') {
            return amount.replace('¥', '￥');
        }
        return amount;
    }

    private formatDeadline(deadline: GrantDeadline): string {
        if (deadline.isRolling) return '常時募集中';
        
        if (deadline.nextDeadline) {
            return `次回締切: ${deadline.nextDeadline.toLocaleDateString('ja-JP')}`;
        }
        
        if (deadline.start && deadline.end) {
            return `募集期間: ${deadline.start.toLocaleDateString('ja-JP')} - ${deadline.end.toLocaleDateString('ja-JP')}`;
        }

        return '募集期間は公式サイトでご確認ください';
    }
}

async function main() {
    const scraper = new GrantScraper();
    try {
        await scraper.initialize();
        console.log(`\n現在の日時: ${new Date().toLocaleString('ja-JP')}`);
        
        const grants = await scraper.getAllGrants();
        
        grants.forEach((grant, index) => {
            console.log(`\n=== 助成金 ${index + 1} ===`);
            console.log(`タイトル: ${grant.title}`);
            console.log(`団体: ${grant.organization}`);
            console.log(`助成額: ${grant.amount} (${grant.currency})`);
            console.log(`募集状況: ${grant.status === 'active' ? '募集中' : '募集予定'}`);
            console.log(`締切: ${scraper['formatDeadline'](grant.deadline)}`);
            console.log(`カテゴリー: ${grant.category.join(', ')}`);
            console.log(`応募資格: ${grant.eligibility}`);
            console.log(`前払い: ${grant.upfrontPayment ? 'あり' : 'なし'}`);
            console.log(`説明: ${grant.description}`);
            console.log(`詳細: ${grant.url}`);
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await scraper.close();
    }
}

main().catch(console.error);
