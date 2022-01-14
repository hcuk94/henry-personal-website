---
layout: post
title: Locking the Teltonika RUT360 to a Specific Cell ID
excerpt: Using a Teltonika RUT360 4G modem, it is possible to 'lock' to a specific mobile cell, for example if this can offer improved speeds
comments: true
---
I recently purchased a Teltonika RUT360 Modem to deliver 4G broadband to my parents' rural home. Of the two available 4G cells to me, one performs very well but the other gives pretty slow speeds (full write-up in [this blog post](https://staging.henrycole.uk/2021/12/28/Delivering-Rural-Broadband-over-4G.html)).

I therefore needed a way to ensure my 4G modem only connects to the more performant cell.

Teltonika have kindly me with provided official instruction for doing this on the RUT360, so I thought I'd write this up here, plus my other findings.

*Please note that this guide is **only** for the RUT360 model. I know for a fact that other models use a different command sequence so please research your own device before running any commands. Even if your device is a RUT360 please exercise caution when running these commands. This page is provided as a guide and I am unable to accept any responsibility for adverse consequences of running these commands.*

Firstly, cell locking isn't a feature in the web UI of the RUT360, so we need to SSH to the device to run a command sequence. You can SSH to the device using 'root' as the username with the password for your 'admin' user in the web UI.

Once logged into SSH, start by running this command to put your device into LTE-only mode:
```
gsmctl -A 'AT+QCFG="NWSCANMODE",3,1'
```
NB: this guide covers locking to a 4G cell, if you are using 3G or below, you may need to do some more research into locking to a 3G cell as I have not tried this.


Next, run this command to show you your neighbouring cells:
```
gsmctl -I
```
You will get a list of available cells, such as the below:
```
root@Teltonika-RUT360:~# gsmctl -I
+QENG: "neighbourcell intra","LTE",1392,365,-7,-107,-82,0,-,-,-,-,-
+QENG: "neighbourcell intra","LTE",1392,135,-20,-127,-93,0,-,-,-,-,-
```
Ideally you should save this output somewhere as it is useful to have the list to hand.
The numbers we need to pay attention to are those that appear directly after "LTE". These are the **earfcn** and **pcid** values which identify the cell.

If you are already connected to the cell to which you wish to lock, you can use the *gsmctl -K* command to identify it:
```
root@Teltonika-RUT360:~/teltonika-cell-autolock# gsmctl -K
+QENG: "servingcell","NOCONN","LTE","FDD",234,20,2E5F02,365,1392,3,4,4,6B2,-107,-7,-80,15,0,20,-
```
NB: when using gsmctl -K, the earfcn and pcid order is reversed. In the above example 365 is the PCID and 1392 is the EARFCN.

If you are not already connected to the cell to which you wish to lock, then work your way through the list of neighbouring cells retrieved from *gsmctl -I* earlier, locking to each one until you are happy you are on the correct one.

**Now for the important bit**; to actually lock the modem to your chosen cell.

The syntax of the command you'll need to run is as follows:
```
gsmctl -A 'AT+QNWLOCK="common/lte",2,**earfcn**,**pcid**'
```
You will need to replace \*\*earfcn\*\* and \*\*pcid\*\* with your earfcn and pcid values retrieved earlier - in my case, 1392 and 365 respectively:
```
gsmctl -A 'AT+QNWLOCK="common/lte",2,1392,365'
```
Once you have run this, the modem should return 'OK' to your command line. You can then run *gsmctl -K* again to show currently connected cell. If connection was successful, it will show your earfcn and pcid in reverse order as I explained above.

If you are trying different cells and connection was not successful, this could be for a number of reasons - if you think a cell should work then try again, but chances are that some which the modem returns will simply not be usable by you.

Finally, if you need to unlock cell, you can use this command:
```
gsmctl -A 'AT+QNWLOCK="common/lte",0'
```
...followed by a restart of the modem.

## Limitations
I have encountered a couple of limitations while using cell locking on my RUT360, as described below.

### Persistency of Lock
I have found, from time to time, that my modem does end up unlocked. It's not entirely clear why, it is possible it doesn't always stick after a reboot or package updates may affect it.

For this reason I recommend keeping a note of the cell earfcn and pcid of your favourite cell. Then, should it become unlocked in future, you can re-run this command sequence to re-apply the lock.

I have also written a small shell script to monitor the current cell and re-apply the lock if the device is not using the correct cell. You can find this script, along with instructions, [at this link](https://github.com/hcuk94/teltonika-cell-autolock).

### Carrier Aggregation
The other limitation I have encountered is that Carrier Aggregation (CA) does not appear to work whilst cell locking is enabled. I believe this may be down to the earfcn/pcid only relating to a single cell, whilst CA uses two - and therefore locking to a cell goes against the definition of CA.

Sadly though, I'm not aware of any resolution to this. I did ask Teltonika but didn't get any further advice from them, so it could be that they don't have a solution to this right now.

Personally I'm still able to get 60mbps without CA, but depending on your available cells you may not be so lucky, so it is worth doing some tests before logging off!

## Sources
With thanks to *VykintasKuzma* from Teltonika who helped me out from my [original confused forum post](https://community.teltonika-networks.com/38696/rut360-cell-lock?show=38739#c38739) to get up and running with cell locking on the RUT360.