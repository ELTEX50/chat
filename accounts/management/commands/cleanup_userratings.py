from django.core.management.base import BaseCommand
from accounts.models import UserRating
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Deletes UserRating entries older than 3 months'

    def handle(self, *args, **kwargs):
        cutoff = timezone.now() - timedelta(days=90)
        deleted, _ = UserRating.objects.filter(submitted_at__lt=cutoff).delete()
        self.stdout.write(self.style.SUCCESS(f'Deleted {deleted} old UserRating entries.')) 