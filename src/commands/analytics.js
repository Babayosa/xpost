import { load, save, nextId } from '../lib/store.js';
import { fmt, table } from '../lib/format.js';
import { ask as askUser, choose } from '../lib/interactive.js';

export function registerAnalytics(program) {
  const analytics = program.command('analytics').description('Engagement tracking and reports');

  analytics
    .command('log')
    .description('Log engagement metrics for a posted item')
    .action(async () => {
      const queue = await load('queue.json');
      const queued = queue.filter(i => i.status === 'queued' || i.status === 'posted');

      if (queued.length === 0) {
        console.log(fmt.warn('No posts in queue to log metrics for.'));
        return;
      }

      console.log(fmt.header('Log Engagement'));
      const rows = queued.map(i => [
        i.id,
        i.status,
        i.contentType,
        (i.content || i.threadParts?.[0] || '').slice(0, 40) + '...',
      ]);
      table(rows, ['ID', 'Status', 'Type', 'Preview']);

      const id = await askUser('\nPost ID to log metrics for: ');
      const postId = parseInt(id, 10);
      const post = queue.find(i => i.id === postId);
      if (!post) {
        console.log(fmt.error('Post not found.'));
        return;
      }

      const impressions = parseInt(await askUser('Impressions: ') || '0', 10);
      const likes = parseInt(await askUser('Likes: ') || '0', 10);
      const retweets = parseInt(await askUser('Retweets: ') || '0', 10);
      const replies = parseInt(await askUser('Replies: ') || '0', 10);
      const bookmarks = parseInt(await askUser('Bookmarks: ') || '0', 10);

      // Mark as posted in queue
      const queueIdx = queue.findIndex(i => i.id === postId);
      queue[queueIdx].status = 'posted';
      await save('queue.json', queue);

      const entries = await load('analytics.json');
      entries.push({
        id: nextId(entries),
        queueItemId: postId,
        content: post.content || post.threadParts?.join('\n'),
        contentType: post.contentType,
        postedAt: post.scheduledFor || new Date().toISOString().split('T')[0],
        metrics: { impressions, likes, retweets, replies, bookmarks },
        loggedAt: new Date().toISOString(),
      });
      await save('analytics.json', entries);
      console.log(fmt.success('Metrics logged.'));
    });

  analytics
    .command('report')
    .description('Show best content types and trends')
    .action(async () => {
      const entries = await load('analytics.json');

      if (entries.length === 0) {
        console.log(fmt.warn('No analytics data yet. Use "xpost analytics log" first.'));
        return;
      }

      console.log(fmt.header('Analytics Report'));

      // Aggregate by content type
      const byType = {};
      for (const e of entries) {
        if (!byType[e.contentType]) {
          byType[e.contentType] = { count: 0, impressions: 0, likes: 0, retweets: 0, replies: 0, bookmarks: 0 };
        }
        const t = byType[e.contentType];
        t.count++;
        t.impressions += e.metrics.impressions;
        t.likes += e.metrics.likes;
        t.retweets += e.metrics.retweets;
        t.replies += e.metrics.replies;
        t.bookmarks += e.metrics.bookmarks;
      }

      console.log(fmt.bold('\nPerformance by Content Type'));
      const typeRows = Object.entries(byType)
        .sort((a, b) => (b[1].likes / b[1].count) - (a[1].likes / a[1].count))
        .map(([type, s]) => [
          type,
          s.count,
          Math.round(s.impressions / s.count),
          Math.round(s.likes / s.count),
          Math.round(s.retweets / s.count),
          Math.round(s.replies / s.count),
        ]);
      table(typeRows, ['Type', 'Posts', 'Avg Imp', 'Avg Likes', 'Avg RT', 'Avg Replies']);

      // Top 5 posts by engagement
      console.log(fmt.bold('\nTop 5 Posts (by likes)'));
      const top = [...entries]
        .sort((a, b) => b.metrics.likes - a.metrics.likes)
        .slice(0, 5);
      const topRows = top.map(e => [
        e.postedAt,
        e.contentType,
        e.metrics.likes,
        e.metrics.impressions,
        (e.content || '').slice(0, 40) + '...',
      ]);
      table(topRows, ['Date', 'Type', 'Likes', 'Imp', 'Preview']);

      // Engagement rate
      const totalImpressions = entries.reduce((s, e) => s + e.metrics.impressions, 0);
      const totalEngagement = entries.reduce((s, e) =>
        s + e.metrics.likes + e.metrics.retweets + e.metrics.replies + e.metrics.bookmarks, 0);
      const rate = totalImpressions > 0 ? ((totalEngagement / totalImpressions) * 100).toFixed(2) : '0';
      console.log(`\n${fmt.bold('Overall Engagement Rate:')} ${rate}%`);
      console.log(fmt.dim(`${entries.length} posts tracked | ${totalImpressions} total impressions`));
    });
}
