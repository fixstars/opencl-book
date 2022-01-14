---
description: >-
  This section will walk through the setup process of available OpenCL
  environments as of January 2012. Note that the name of the executables may
  change in the future.
---

# Development Environment Setup

### _Intel OpenCL Setup_&#x20;

In this section, we will walkthrough the process of installing Intel OpenCL SDK on Windows and Linux. The installation steps can also be found on their website:&#x20;

{% embed url="http://software.intel.com/en-us/articles/installation-notes-opencl-sdk" %}

**For Windows**&#x20;

To install the Intel OpenCL SDK on Windows, first download the executable from their website. Note that both 32-bit and 64-bit exist, and the version should be chosen accordingly.&#x20;

{% embed url="http://software.intel.com/en-us/articles/installation-notes-opencl-sdk" %}

**Figure 3.1: Intel OpenCL SDK download screen**&#x20;

![](<../.gitbook/assets/Screen Shot 2022-01-02 at 9.06.50 PM.png>)

Unless there are special requirements, the installation should be performed using the default values.&#x20;

**For Linux**&#x20;

The installation executable is packaged as a RPM file for Red Hat distribution. The RPM can be downloaded from the same URL as above. Extract the downloaded file and install the RPM as root.&#x20;

**Example for Intel OpenCL SDK 1.5**&#x20;

> \# tar xzf intel\_ocl\_sdk\_1.5\_x64.tgz&#x20;
>
> \# rpm -i intel\_ocl\_sdk\_1.5\_x64.rpm&#x20;

We have also verified the installation procedure could be performed successfully on Fedora 16 Desktop (64-bit).&#x20;

### _Apple OpenCL Setup_&#x20;

OpenCL is included by default on Mac OS X 10.6 and later, but requires Apple's IDE "Xcode" for development. The Xcode setup procedure varies depending on the version of the Mac OS X. Here, we will walk through the installation of Xcode for Lion and Snow Leopard&#x20;

**For Lion**&#x20;

The version of Xcode that can be used on Lion is "Xcode 4". The installation can be done in 1 of the 2 following ways:&#x20;

1\) From the AppStore (**Figure 3.2**)&#x20;

2\) From Apple's Xcode site (http://developer.apple.com/xcode/)&#x20;

**Figure 3.2: Xcode download screen on the AppStore**&#x20;

![](<../.gitbook/assets/Screen Shot 2022-01-02 at 9.09.16 PM.png>)

**For Snow Leopard**&#x20;

The Xcode cannot be installed from the AppStore on Snow Leopard, so this must be done manually. Also, "Xcode 4" cannot be installed on Snow Leopard, so "Xcode 3" must be used instead.&#x20;

Access Apple's Xcode site (http://developer.apple.com/xcode) and login with your Apple ID. You should get the screen shown in **Figure 3.3**. Make sure to follow the link to download Xcode 3.&#x20;

**Figure 3.3: Xcode 3 download screen (http://developer.apple.com/xcode/)**&#x20;

![](<../.gitbook/assets/Screen Shot 2022-01-02 at 9.09.59 PM.png>)

Once you have the installation package for Xcode, double click on the dmg file, and then double click on the mpkg file to start the installation of Xcode (**Figure 3.4**).&#x20;

**Figure 3.4: File in Xcode archives**&#x20;

![](<../.gitbook/assets/Screen Shot 2022-01-02 at 9.10.36 PM.png>)

The installation can be performed by following the default options for the most part, except for one part. In the screen shown in **Figure 3.5** for custom installation, make sure to place a check mark on "UNIX Development".&#x20;

**Figure 3.5: Custom installation setting**&#x20;

![](<../.gitbook/assets/Screen Shot 2022-01-02 at 9.11.22 PM.png>)

Click next and continue on with the installation.&#x20;

### _NVIDIA OpenCL Setup_&#x20;

In this section, we will walk through the procedures for installing OpenCL for NVIDIA GPU's on Windows and Linux.&#x20;

**For Windows**&#x20;

We will walkthrough the procedures for installing NVIDIA's OpenCL on a 32-bit Windows 7 machine. First, find out what GPU is present from Device Manager -> Display Adapter. Make sure this device supports CUDA. You will also need Visual Studio to build the SDK samples. For 32-bit, the Express Edition will suffice. Download and install Microsoft Visual C++ 2010 Express Edition from the URL below.&#x20;

{% embed url="http://www.microsoft.com/japan/msdn/vstudio/express" %}

Download the following files from NVIDIA's OpenCL download page (http://developer.nvidia.com/cuda-downloads):&#x20;

* &#x20;Developer Drivers&#x20;
  * Desktop: devdriver\_4.0\_winvista-win7\_32\_286.19\_general.exe&#x20;
  * Notebook: devdriver\_4.0\_winvista-win7\_32\_286.16\_notebook.exe&#x20;
* CUDA Toolkit&#x20;
  * &#x20;cudatoolkit\_4.1.28\_win\_32.msi&#x20;
* GPU Computing SDK&#x20;
  * gpucomputingsdk\_4.1.28\_win\_32.exe&#x20;

**Figure 3.6: NVIDIA OpenCL download page**&#x20;

![](<../.gitbook/assets/Screen Shot 2022-01-02 at 9.13.46 PM.png>)

The installation should be done in the following order: NVIDIA Driver, CUDA Toolkit, GPU Computing SDK. Double click on the NVIDIA driver executable to start the installation.

**Figure 3.7: NVIDIA driver install screen**&#x20;

![](<../.gitbook/assets/Screen Shot 2022-01-02 at 9.14.29 PM.png>)

Follow the prompts on the screens (**Figure 3.7**). Restart the system when you are prompted to do so.&#x20;

Next, install the CUDA Toolkit by double clicking on the installer. Follow the prompts on the screens (**Figure 3.8**).&#x20;

**Figure 3.8: NVIDIA toolkit install screen**&#x20;

![](<../.gitbook/assets/Screen Shot 2022-01-02 at 9.15.04 PM.png>)

Finally, install the GPU Computing SDK. Follow the prompts on the screens (**Figure 3.9**). You will be prompted to register during the installation. Once the installation finishes successfully, restart the system.

**Figure 3.9: NVIDIA GPU computing SDK install screen**&#x20;

![](<../.gitbook/assets/Screen Shot 2022-01-02 at 9.15.57 PM.png>)

Now we are ready to execute the sample programs contained in the GPU Computing SDK. On your Desktop should be an icon with the name "NVIDIA GPU Computing SDK Browser". This should show a listing of all the sample programs. Open the "OpenCL Samples" tab to show a listing of the sample codes written in OpenCL. The listing is ordered based on difficulty, with basic programs at the top and advanced programs at the bottom. Some samples include a whitepaper that explains the program content.

**For Linux**&#x20;

In this section, we will install NVIDIA OpenCL on Ubuntu 11.04 (64 bit). First, make sure that the GPU is CUDA-enabled by executing the following command.&#x20;

> \# lspci | grep -i nvidia&#x20;

\> OS setup&#x20;

Before we can install CUDA, we may need to reconfigure Ubuntu's graphic driver. This is due to the fact that the open-source version of the NVIDIA GPU driver, called "nouveau", may conflict with NVIDIA's driver.&#x20;

First, remove all packages that start with "nvidia" using the command below.&#x20;

> $ sudo apt-get --purge remove nvidia\*

Next, create a blacklist file shown in **List 3.1** under /etc/modprobe.d/. This is to make sure that no nouveau-related kernel modules get loaded.&#x20;

**List 3.1: /etc/modprobe.d/blacklist-nouveau.conf**&#x20;

> blacklist nvidiafb&#x20;
>
> blacklist nouveau&#x20;
>
> blacklist rivafb&#x20;
>
> blacklist rivatv&#x20;
>
> blacklist vga16fb&#x20;
>
> options nouveau modeset=0&#x20;

Now, update initramfs using the command below.&#x20;

> $ sudo update-initramfs -u&#x20;

At this point, the system should be restarted. Once the system is restarted, install tools required for development.&#x20;

> $ sudo apt-get update
>
> $ sudo apt-get install build-essential&#x20;

\> CUDA setup&#x20;

Download the following files from NVIDIA's OpenCL download page (**Figure 3.10**) (http://developer.nvidia.com/cuda-downloads):&#x20;

\* Developer Drivers&#x20;

\- Desktop: NVIDIA-Linux-x86\_64-285.05.33.run&#x20;

\* CUDA Toolkit&#x20;

\- cudatoolkit\_4.1.28\_linux\_64\_ubuntu11.04.run&#x20;

\* GPU Computing SDK&#x20;

\- gpucomputingsdk\_4.1.28\_linux.run&#x20;

**Figure 3.10: NVIDIA OpenCL download page (for Linux)**&#x20;

![](<../.gitbook/assets/Screen Shot 2022-01-02 at 9.24.44 PM.png>)

First task is to install the driver. However, the driver installation cannot be performed when the X Window System is running. Switch into the console mode by logging out and pressing "Alt + Ctrl + F2". Enter the following command to stop the display manager.&#x20;

> $ sudo service gdm stop&#x20;

You may need to press "Alt + Ctrl + F2" again to get back to the prompt. Enter the following to install the driver.&#x20;

> $ sudo sh NVIDIA-Linux-x86\_64-285.05.33.run&#x20;

You will receive a few prompts, but select "OK" throughout. Once the installation finishes successfully, restart the system by entering:&#x20;

> $ sudo reboot&#x20;

Now we are ready to install the CUDA Toolkit. Enter the following command to do so.&#x20;

> $ sudo sh cudatoolkit\_4.1.28\_linux\_64\_ubuntu11.04.run&#x20;

You will be prompted for the installation directory, but use the default location, which should be /usr/local/cuda/. Once the installation is complete, a few environmental variables must be set in .bashrc (**List 3.2**).&#x20;

**List 3.2: Append this at the end of the bashrc**&#x20;

> export CUDA\_HOME="/usr/local/cuda"&#x20;
>
> export LD\_LIBRARY\_PATH="${LD\_LIBRARY\_PATH}:${CUDA\_HOME}/lib64"&#x20;
>
> export PATH=${CUDA\_HOME}/bin:${PATH}&#x20;

Lastly, the GPU Computing SDK will be installed. This SDK should be installed for each users. Login as a normal user, and enter the following command.

> $ sh gpucomputingsdk\_4.1.28\_linux.run

You will again be asked for an installation directory, but use the default location, which should be under $HOME. You maybe asked for the directory for CUDA Toolkit, in which case you should enter /usr/local/cuda/. The installation should now be finished.

### _AMD OpenCL Setup_&#x20;

In this section, we will walk through the procedures for installing OpenCL for AMD GPU's on Windows and Linux. OpenCL for AMD is contained in "AMD APP SDK", which first requires the installation of the latest "Catalyst Software Suite", which contains drivers AMD CPU/GPU, OpenCL runtime, etc.&#x20;

**For Windows**&#x20;

In this section, we will install AMD OpenCL on Windows 7.&#x20;

Download and install the latest Catalyst Software Suite from the URL below (**Figure 3.11**):&#x20;

{% embed url="http://support.amd.com/us/gpudownload/Pages/index.aspx" %}

**Figure 3.11: Catalyst Software Suite download screen**&#x20;

![](<../.gitbook/assets/Screen Shot 2022-01-02 at 9.42.38 PM.png>)

Enter your system information for Steps 1\~4, and press Step 5. This should give you a listing of the appropriate Catalyst Software Suite. Select the suite most appropriate to the system.&#x20;

Now, download AMD APP SDK from the URL below (**Figure 3.12**). The most up-to-date version is 1.6.&#x20;

{% embed url="http://developer.amd.com/sdks/AMDAPPSDK/downloads/Pages/default.aspx" %}

**Figure 3.12: AMD APP SDK download screen**&#x20;

![](<../.gitbook/assets/Screen Shot 2022-01-02 at 9.44.15 PM.png>)

Download and install the SDK, and restart the system once finished.&#x20;

**For Linux**&#x20;

In this section, we will install AMD OpenCL on Ubuntu 11.4.&#x20;

As is the case with Windows, the Catalyst Software Suite must be installed prior to the AMD APP SDK. To do so, first open the System Settings, located on the panel on the left side of the screen (**Figure 3.13**).&#x20;

**Figure 3.13: Ubuntu System Settings screen**&#x20;

![](<../.gitbook/assets/Screen Shot 2022-01-02 at 9.45.09 PM.png>)

Select "Additional Drivers" in the Hardware section. This will show a listing of proprietary drivers from vendors (**Figure 3.14** Select "Additional Drivers" in the Hardware section. This will show a listing of proprietary drivers from venders).&#x20;

**Figure 3.14: Vendor-supplied proprietary driver selection screen**&#x20;

![](<../.gitbook/assets/Screen Shot 2022-01-02 at 10.09.47 PM.png>)

If more than one driver is listed, selecting one and clicking the "Activate" button will start the installation.&#x20;

Next, download AMD APP SDK from the URL below (**Figure 3.12**):&#x20;

{% embed url="http://developer.amd.com/sdks/AMDAPPSDK/downloads/Pages/default.aspx" %}

Start the installation by entering commands as follows.&#x20;

**For 32bit**&#x20;

> $ tar xzf AMD-APP-SDK-v2.6-lnx32.tgz&#x20;
>
> $ sudo ./Install-AMD-APP.sh&#x20;
>
> \[sudo] password for username:&#x20;
>
> 32-bit Operating System Found...&#x20;
>
> Starting Installation of AMD APP....&#x20;
>
> SDK package name is :AMD-APP-SDK-v2.6-RC3-lnx32.tgz&#x20;
>
> Current directory path is : /home/opencl/appsdk&#x20;
>
> Untar command executed succesfully, The SDK package available&#x20;
>
> Untar command executed succesfully, The ICD package available&#x20;
>
> Copying files to /opt/AMDAPP/ ...&#x20;
>
> SDK files copied successfully at /opt/AMDAPP/&#x20;
>
> Updating Environment vairables...&#x20;
>
> 32-bit path is :/opt/AMDAPP/lib/x86&#x20;
>
> Environment vairables updated successfully&#x20;
>
> /sbin/ldconfig.real: Can't stat /lib/i686-linux-gnu: No such file or directory&#x20;
>
> /sbin/ldconfig.real: Can't stat /usr/lib/i686-linux-gnu: No such file or directory&#x20;
>
> /sbin/ldconfig.real: Path \`/lib/i386-linux-gnu' given more than once&#x20;
>
> /sbin/ldconfig.real: Path \`/usr/lib/i386-linux-gnu' given more than once&#x20;
>
> AMD APP installation Completed&#x20;
>
> \>> Reboot required to reflect the changes&#x20;
>
> \>> Please ignore the ldconfig errors, Expected behaviour&#x20;
>
> \>> Please refer the 'AMDAPPlog file' in the same directory&#x20;
>
> \>> Refer the README.txt in the same directory for more info&#x20;

****

As is shown in the installation log above, you should restart the system. After restarting, make sure the setup has completed successfully by making sure files such as /opt/AMDAPP/include/CL/cl.h and /usr/lib/libOpenCL\* are present.

