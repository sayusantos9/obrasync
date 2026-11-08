import datetime,hashlib,json,sys,tempfile,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent.parent/'scripts'))
from recovery_drill import retain_verified_backups,REF

class BackupRetentionTests(unittest.TestCase):
 def test_keeps_two_latest_verified_and_removes_older_than_thirty_days(self):
  now=datetime.datetime.now(datetime.timezone.utc)
  with tempfile.TemporaryDirectory(prefix='obrasync-retention-test-') as folder:
   root=Path(folder)
   for index,age in enumerate((0,40,50,60)):
    name='20260101T000000Z-'+f'{index:08x}';data=f'encrypted-fixture-{index}'.encode();(root/(name+'.obsbackup')).write_bytes(data)
    (root/(name+'.verification.json')).write_text(json.dumps({'status':'PASS','project':REF,'created_at':(now-datetime.timedelta(days=age)).isoformat(),'encrypted_backup_sha256':hashlib.sha256(data).hexdigest()}),encoding='utf-8')
   self.assertEqual(retain_verified_backups(root,now),2)
   self.assertEqual(len(list(root.glob('*.obsbackup'))),2)
   self.assertTrue((root/'20260101T000000Z-00000001.obsbackup').exists())
 def test_does_not_prune_unverified_or_altered_artifacts(self):
  now=datetime.datetime.now(datetime.timezone.utc)
  with tempfile.TemporaryDirectory(prefix='obrasync-retention-test-') as folder:
   root=Path(folder);name='20260101T000000Z-00000000';artifact=root/(name+'.obsbackup');artifact.write_bytes(b'changed')
   (root/(name+'.verification.json')).write_text(json.dumps({'status':'PASS','project':REF,'created_at':(now-datetime.timedelta(days=100)).isoformat(),'encrypted_backup_sha256':'wrong'}),encoding='utf-8')
   self.assertEqual(retain_verified_backups(root,now),0);self.assertTrue(artifact.exists())

if __name__=='__main__':unittest.main()
