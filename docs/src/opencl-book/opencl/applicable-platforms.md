---
description: >-
  This section will introduce the main concepts and key terms necessary to gain
  familiarity with OpenCL. Some terms may be shortened for the ease of reading
  (e.g. OpenCL Devices → Devices).
---

# Applicable Platforms

### _Host + Device_&#x20;

Up until this point, the processors in heterogeneous systems (OpenCL platforms) were called control processors and compute processors, but OpenCL defines these as follows.&#x20;

**1. Host**&#x20;

Environment where the software to control the devices is executed. This is typically the CPU as well as the memory associated with it.&#x20;

**2. OpenCL Devices**&#x20;

Environment where the software to perform computation is executed. GPU, DSP, Cell/B.E., CPU are some of the typically used devices, which contain numerous compute units. The memory associated with the processors is also included in the definition of a device.&#x20;

There are no rules regarding how the host and the OpenCL device are connected. In the case of CPU + GPU, PCI Express is used most often (**Figure 2.4**). For CPU servers, the CPUs can be connected over Ethernet, and use TCP/IP for data transfer.&#x20;

**Figure 2.4: Host and OpenCL device for CPU and GPU (CUDA) environment**&#x20;

![](<../.gitbook/assets/Screen Shot 2021-12-23 at 10.41.19 AM.png>)

OpenCL device is expected to contain multiple Compute Units, which is made up of multiple Processing Elements. As an example, the GPU described in OpenCL terms is as follows (**Figure 2.5**).&#x20;

• OpenCL Device - GPU&#x20;

• Compute Unit - Streaming Multiprocessor (SM)&#x20;

• Processing Element - Scalar Processor (SP)&#x20;

**Figure 2.5: Symmetry of OpenCL device and GPU configuration**&#x20;

![](<../.gitbook/assets/Screen Shot 2022-01-02 at 8.36.11 PM.png>)

### _Application Structure_&#x20;

This section will discuss a typical application that runs on the host and device.&#x20;

OpenCL explicitly separates the program run on the host side and the device side (**Figure 2.6**).&#x20;

**Figure 2.6: Host program and kernel**&#x20;

![](<../.gitbook/assets/Screen Shot 2022-01-02 at 8.37.57 PM.png>)

The program run on the device is called a kernel. When creating an OpenCL application, this kernel is written in OpenCL C, and compiled using the OpenCL compiler for that device.&#x20;

The host is programmed using C/C++ using the OpenCL runtime API, which is linked to an OpenCL runtime library implemented for the host-device combination. This code is compiled using compilers such as GCC and Visual Studio.&#x20;

As stated earlier, the host controls the device using the OpenCL runtime API. Since OpenCL expects the device to not be running an operating system, the compiled kernel needs help from the host in order to be executed on the device. Since the OpenCL runtime implementation takes care of these tasks, the programmer will not have to know the exact details of how to perform these tasks, which is unique to each platform combination.&#x20;

### _Parallel Programming Models_&#x20;

OpenCL provides API for the following programming models.&#x20;

• Data parallel programming model&#x20;

• Task parallel programming model&#x20;

In the data parallel programming model, the same kernel is passed through the command queue to be executed simultaneously across the compute units or processing elements.&#x20;

For the task parallel programming model, different kernels are passed through the command queue to be executed on different compute units or processing elements (**Figure 2.7**)&#x20;

**Figure 2.7: Data parallel and Task parallel**&#x20;

![](<../.gitbook/assets/Screen Shot 2022-01-02 at 8.39.00 PM.png>)

For data parallel programming models, each kernel requires a unique index so the processing is performed on different data sets. OpenCL provides this functionality via the concept of index space.&#x20;

OpenCL gives an ID to a group of kernels to be run on each compute unit, and another ID for each kernel within each compute unit, which is run on each processing element. The ID for the compute unit is called the Workgroup ID, and the ID for the processing element is called the Work Item ID. When the user specifies the total number of work items (global item), and the number of work items to be ran on each compute unit (local item), the IDs are given for each item by the OpenCL runtime API. The index space is defined and accessed by this ID set. The number of workgroups can be computed by dividing the number of global items by the number of local items (**Figure 2.8**).&#x20;

**Figure 2.8: Example of index-space deployment**&#x20;

![](<../.gitbook/assets/Screen Shot 2022-01-02 at 8.39.47 PM.png>)

The ID can have up to 3 dimensions to correspond to the data to process. The retrieval of this ID is necessary when programming the kernel, so that each kernel processes different sets of data.&#x20;

The index space is defined for task parallel processing as well, in which both the number of work groups and the work items are 1.&#x20;

### _Memory Model_&#x20;

OpenCL allows the kernel to access the following 4 types of memory (**Figure 2.9**).&#x20;

**1. Global Memory**&#x20;

Memory that can be read from all work items. It is physically the device's main memory.&#x20;

**2. Constant Memory**&#x20;

Also memory that can be read from all work items. It is physically the device's main memory, but can be used more efficiently than global memory if the compute units contain hardware to support constant memory cache. The cost memory is set and written by the host.&#x20;

**3. Local Memory**&#x20;

Memory that can be read from work items within a work group. It is physically the shared memory on each compute units.&#x20;

**4. Private Memory**&#x20;

Memory that can only be used within each work item. It is physically the registers used by each processing element.

**Figure 2.9: OpenCL memory model**&#x20;

![](<../.gitbook/assets/Screen Shot 2022-01-02 at 8.40.56 PM.png>)

The 4 memory types mentioned above all exist on the device. The host side has its own memory as well. However, only the kernel can only access memory on the device itself. The host, on the other hand, is capable of reading and writing to the global, constant, and the host memory.&#x20;

Note that the physical location of each memory types specified above assumes NVIDIA's GPUs. The physical location of each memory types may differ depending on the platform. For example, if the devices are x86 multi-core CPUs, all 4 memory types will be physically located on the main memory on the host. However, OpenCL requires the explicit specification of memory types regardless of the platform.&#x20;
